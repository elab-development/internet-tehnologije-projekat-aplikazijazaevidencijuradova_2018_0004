import os
from flask import Flask, request, jsonify, send_file, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_cors import CORS

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
    username = db.Column(db.String(255), nullable=False)
    mark = db.Column(db.Integer, nullable=True)
    documentpath = db.Column(db.String(255), nullable=True)

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
        username=username,
        documentpath=file_path
    )
    db.session.add(new_record)
    db.session.commit()

    return jsonify({"message": "File uploaded successfully", "record_id": new_record.id}), 201

@app.route('/records', methods=['GET'])
def get_records():
    username = request.headers.get('username')

    if username:
        # Vraća sve zapise za određenog korisnika
        records = Record.query.filter_by(username=username).all()
    else:
        # Vraća sve zapise ako username nije prosleđen
        records = Record.query.all()

    # Formatiranje odgovora
    records_list = []
    for record in records:
        records_list.append({
            "id": record.id,
            "documentName": record.document_name,
            "documentType": record.document_type,
            "username": record.username,
            "mark": record.mark
        })

    return jsonify(records_list), 200

@app.route('/records/<document_name>', methods=['GET'])
def get_document(document_name):
    username = request.headers.get('username')

    if not username:
        return jsonify({"error": "Username header is required"}), 400

    record = Record.query.filter_by(document_name=document_name, username=username).first()

    if record is None:
        return jsonify({"error": "Document not found for the given user"}), 404

    if not record.documentpath or not os.path.exists(record.documentpath):
        return jsonify({"error": "Document path is invalid"}), 404

    return send_file(record.documentpath, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
