import os, requests
from flask import Flask, request, jsonify, send_file, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_cors import CORS
from enum import Enum

app = Flask(__name__)

CORS(app)

# Konfiguracija baze podataka
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:secret@localhost:5430/rgconfig_backup'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'upload'

# Definišemo custom metadata da koristimo šemu 'test'
metadata = MetaData(schema='test')
db = SQLAlchemy(app, metadata=metadata)

# Definicija modela Player
class Player(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    userType = db.Column('usertype',db.String(20), nullable=False)

    def __repr__(self):
        return f'<Player {self.username}>'

# Definicija modela Record
class Record(db.Model):
    __tablename__ = 'records'
    id = db.Column(db.Integer, primary_key=True)
    document_name = db.Column(db.String(255), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    mark = db.Column(db.Integer, nullable=True)
    documentpath = db.Column(db.String(255), nullable=True)
    
    player = db.relationship('Player', backref=db.backref('records', lazy=True))

    def __repr__(self):
        return f'<Record {self.document_name}>'


# POST /login handler
@app.route('/login', methods=['POST'])
def login():
    username = request.headers.get('username')
    password = request.headers.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    player = Player.query.filter_by(username=username, password=password).first()

    if player:
        return jsonify({"message": "Login successful", "userType": player.userType}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# POST /user-details/<username> handler
@app.route('/user-details/<username>', methods=['GET'])
def get_user_details(username):
    player = Player.query.filter_by(username=username).first()

    if player:
        return jsonify({
            "id": player.id,
            "username": player.username,
            "userType": player.userType
        }), 200
    else:
        return jsonify({"error": "User not found"}), 404

# POST /upload-file handler
@app.route('/upload-file', methods=['POST'])
def upload_file():
    # Čitanje headera
    document_type = request.headers.get('documentType')
    username = request.headers.get('username')

    # Proveri da li su headeri prisutni
    if not document_type or not username:
        return jsonify({"error": "documentType and username headers are required"}), 400

    # Pronađi korisnika prema username-u
    player = Player.query.filter_by(username=username).first()
    if not player:
        return jsonify({"error": "User not found"}), 404

    # Proveri da li je fajl priložen
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    # Proveri da li je fajl priložen ispravno
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Kreiraj direktorijum ako ne postoji
    user_folder = os.path.join(app.config['UPLOAD_FOLDER'], username)
    os.makedirs(user_folder, exist_ok=True)

    # Sačuvaj fajl
    file_path = os.path.join(user_folder, file.filename)
    file.save(file_path)

    # Kreiraj novi record u bazi
    new_record = Record(
        document_name=file.filename,
        document_type=document_type,
        player_id=player.id,
        documentpath=file_path
    )
    db.session.add(new_record)
    db.session.commit()

    return jsonify({"message": "File uploaded successfully", "record_id": new_record.id}), 201

# GET /records handler
@app.route('/records', methods=['GET'])
def get_records():
    username = request.headers.get('username')

    if username:
        player = Player.query.filter_by(username=username).first()
        if not player:
            return jsonify({"error": "User not found"}), 404
        if player.userType == 'user':
            records = Record.query.filter_by(player_id=player.id).all()
        else:
            records = Record.query.all()

    # Formatiranje odgovora
    records_list = []
    for record in records:
        records_list.append({
            "id": record.id,
            "documentName": record.document_name,
            "documentType": record.document_type,
            "username": record.player.username,
            "mark": record.mark
        })

    return jsonify(records_list), 200

# GET /records/<document_name> handler
@app.route('/records/<document_name>', methods=['GET'])
def get_document(document_name):
    username = request.headers.get('username')

    if not username:
        return jsonify({"error": "Username header is required"}), 400

    player = Player.query.filter_by(username=username).first()
    if not player:
        return jsonify({"error": "User not found"}), 404

    record = Record.query.filter_by(document_name=document_name, player_id=player.id).first()

    if record is None:
        return jsonify({"error": "Document not found for the given user"}), 404

    if not record.documentpath or not os.path.exists(record.documentpath):
        return jsonify({"error": "Document path is invalid"}), 404

    return send_file(record.documentpath, as_attachment=True)

@app.route('/records/<document_name>', methods=['DELETE'])
def delete_record(document_name):
    username = request.headers.get('username')

    if not username:
        return jsonify({"error": "Username header is required"}), 400

    player = Player.query.filter_by(username=username).first()
    if not player:
        return jsonify({"error": "User not found"}), 404

    if player.userType =='admin':
        record = Record.query.filter_by(document_name=document_name).first()
    else:
        record = Record.query.filter_by(document_name=document_name, player_id=player.id).first()

    if record is None:
        return jsonify({"error": "Record not found"}), 404

    try:
        # Ako postoji putanja do dokumenta, izbriši fajl sa diska
        if record.documentpath and os.path.exists(record.documentpath):
            os.remove(record.documentpath)

        # Izbriši zapis iz baze
        db.session.delete(record)
        db.session.commit()

        return jsonify({"message": "Record and file deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()  # U slučaju greške, poništi promene
        return jsonify({"error": str(e)}), 500

# POST /record/rate handler
@app.route('/record/rate', methods=['POST'])
def rate_record():
    data = request.get_json()

    # Provera da li svi potrebni parametri postoje
    document_name = data.get('documentName')
    username = data.get('user')
    mark = data.get('mark')

    if not document_name or not username or mark is None:
        return jsonify({"error": "documentName, user, and mark are required"}), 400

    player = Player.query.filter_by(username=username).first()
    if not player:
        return jsonify({"error": "User not found"}), 404

    # Pronađi zapis u bazi koji odgovara korisniku i dokumentu
    record = Record.query.filter_by(document_name=document_name, player_id=player.id).first()

    if record is None:
        return jsonify({"error": "Record not found"}), 404

    # Ažuriraj ocenu (mark)
    record.mark = mark
    db.session.commit()

    return jsonify({"message": "Record updated successfully", "record_id": record.id}), 200

# Endpoint za proveru fajla sa VirusTotal
@app.route('/record/check', methods=['GET'])
def check_document():
    document_name = request.headers.get('documentName')
    username = request.headers.get('username')

    if not document_name or not username:
        return jsonify({"error": "documentName and username headers are required"}), 400

    player = Player.query.filter_by(username=username).first()
    if not player:
        return jsonify({"error": "User not found"}), 404

    if player.userType =='admin':
        record = Record.query.filter_by(document_name=document_name).first()
    else:
        record = Record.query.filter_by(document_name=document_name, player_id=player.id).first()

    if record is None:
        return jsonify({"error": "Record not found"}), 404

    if not record.documentpath or not os.path.exists(record.documentpath):
        return jsonify({"error": "Document path is invalid"}), 404

    # Proveri fajl sa VirusTotal API-jem
    file_path = record.documentpath
    files = {'file': open(file_path, 'rb')}
    headers = {
        'x-apikey': '111b117115eea436fd7df6c062b48b2d5ad90174d8f753f44ced01010fbac931'
    }

    response = requests.post('https://www.virustotal.com/api/v3/files', headers=headers, files=files)

    print("TEST")
    print(response)
    # Parsiramo JSON odgovor iz VirusTotal API-ja
    api_response = response.json()
    file_id = api_response['data']['id']

    # Ispisujemo vrednost id u terminalu
    print(f"File ID: {file_id}")
    response = requests.get(f'https://www.virustotal.com/api/v3/analyses/{file_id}', headers=headers)

    print(f"Response: {response}")
    if response.status_code != 200:
        return jsonify({"error": "Error checking file with VirusTotal"}), response.status_code
    print(f"JSON: {response.json()}")
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(debug=True)
