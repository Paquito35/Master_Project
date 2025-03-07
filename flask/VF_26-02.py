from flask import Flask, render_template, request, jsonify, send_file # type: ignore
import os
import shutil
from PyPDF2 import PdfReader # type: ignore
from docx import Document # type: ignore
import torch
from TTS.api import TTS # type: ignore
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
STATIC_AUDIO_FOLDER = 'static/audio' 
os.makedirs(STATIC_AUDIO_FOLDER, exist_ok=True)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

device = "cuda" if torch.cuda.is_available() else "cpu"
MODELS = {
    "your_tts": {
        "name": "tts_models/multilingual/multi-dataset/your_tts",
        "params": {"language": "fr-fr", "speaker_wav": "uploads/recording.wav"}
    },
    "xtts_v2": {
        "name": "tts_models/multilingual/multi-dataset/xtts_v2",
        "params": {"language": "fr"},
        "speakers": ["Gracie Wise", "Daisy Studious", "Tammie Ema"]
    }
}
selected_model = "your_tts"

def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    return "".join(page.extract_text() for page in reader.pages if page.extract_text())

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return "\n".join(paragraph.text for paragraph in doc.paragraphs)

def synthesize_speech(text, model, speaker_wav=None, speaker_id=None):
    output_file = os.path.join(OUTPUT_FOLDER, "output.wav")
    model_info = MODELS[model]
    tts = TTS(model_name=model_info["name"], progress_bar=True).to(device)
    params = model_info["params"].copy()
    
    if model == "xtts_v2":
        if speaker_wav:
            params["speaker_wav"] = speaker_wav
        if speaker_id:
            params["speaker"] = speaker_id  # Use selected speaker
    
    tts.tts_to_file(text=text, **params, file_path=output_file)
    return output_file


@app.route('/')
def index():
    recording_path = request.args.get("recording")
    # Pass the MODELS dictionary to the template
    return render_template('index.html', models=MODELS, recording_path=recording_path)


@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if the 'file' is in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file received"})
    
    # Save the uploaded file
    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    # Extract text from the file (PDF or DOCX)
    if file.filename.endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif file.filename.endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        return jsonify({"error": "Unsupported format"})
    
    # Get the selected model and speaker
    model = request.form.get("model", "your_tts")
    speaker_wav = None
    speaker_id = request.form.get("speaker", None)  # Get selected speaker

    # If using a custom voice (your_tts), save the speaker WAV file
    if model == "your_tts" and 'speaker_wav' in request.files:
        speaker_file = request.files['speaker_wav']
        speaker_wav = os.path.join(UPLOAD_FOLDER, speaker_file.filename)
        speaker_file.save(speaker_wav)
    
    # Generate the speech audio file using the chosen model
    audio_file_path = synthesize_speech(text, model, speaker_wav, speaker_id)
    
    # If the audio file is generated as a path (string), move or copy the file to the static folder
    if isinstance(audio_file_path, str):
        audio_filename = os.path.basename(audio_file_path)
        destination_path = os.path.join(STATIC_AUDIO_FOLDER, audio_filename)
        
        # Copy the generated audio file to the static directory
        shutil.copy(audio_file_path, destination_path)
        
        # Return the URL to the audio file in the static folder
        return jsonify({"text": text, "audio": f'/static/audio/{audio_filename}'})
    
    # Handle other cases where the audio file is directly available as a file object
    return jsonify({"error": "Failed to generate audio"})

@app.route('/record')
def record_page():
    return render_template('record.html')

@app.route('/save_recording', methods=['POST'])
def save_recording():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file received"})

    file = request.files['audio']
    file_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(file_path)

    return jsonify({"message": "Recording saved", "file_path": file_path})

if __name__ == '__main__':
    app.run(debug=True)
