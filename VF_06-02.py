import os
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PyPDF2 import PdfReader
from docx import Document
import torch
from TTS.api import TTS

# Vérifier si un GPU est disponible
device = "cuda" if torch.cuda.is_available() else "cpu"

# Liste des modèles disponibles et leurs paramètres spécifiques
MODELS = {
    "your_tts": {
        "name": "tts_models/multilingual/multi-dataset/your_tts",
        "params": {"language": "fr-fr", "speaker_wav": "output/ez.wav"}
    },
    "xtts_v2": {
        "name": "tts_models/multilingual/multi-dataset/xtts_v2",
        "params": {"language": "fr"},
        "speakers": ["Claribel Dervla", "Daisy Studious", "Gracie Wise", "Tammie Ema", "Alison Dietlinde", "Ana Florence", "Annmarie Nele", "Asya Anara", "Brenda Stern", "Gitta Nikolina", "Henriette Usha", "Sofia Hellen", "Tammy Grit", "Tanja Adelina", "Vjollca Johnnie", "Andrew Chipper", "Badr Odhiambo", "Dionisio Schuyler", "Royston Min", "Viktor Eka", "Abrahan Mack", "Adde Michal", "Baldur Sanjin", "Craig Gutsy", "Damien Black", "Gilberto Mathias", "Ilkin Urbano", "Kazuhiko Atallah", "Ludvig Milivoj", "Suad Qasim", "Torcull Diarmuid", "Viktor Menelaos", "Zacharie Aimilios", "Nova Hogarth", "Maja Ruoho", "Uta Obando", "Lidiya Szekeres", "Chandra MacFarland", "Szofi Granger", "Camilla Holmström", "Lilya Stainthorpe", "Zofija Kendrick", "Narelle Moon", "Barbora MacLean", "Alexandra Hisakawa", "Alma María", "Rosemary Okafor", "Ige Behringer", "Filip Traverse", "Damjan Chapman", "Wulf Carlevaro", "Aaron Dreschner", "Kumar Dahl", "Eugenio Mataracı", "Ferran Simen", "Xavier Hayasaka", "Luis Moray", "Marcos Rudaski"]
    }
}

# Variable globale pour stocker le modèle et le speaker sélectionnés
selected_model = "your_tts"
selected_speaker = "Gracie Wise"
text = ""

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        extracted_text = "".join(page.extract_text() for page in reader.pages if page.extract_text())
        return extracted_text
    except Exception as e:
        messagebox.showerror("Erreur", f"Impossible de lire le fichier PDF.\n{str(e)}")
        return None

def extract_text_from_docx(file_path):
    try:
        doc = Document(file_path)
        extracted_text = "\n".join(paragraph.text for paragraph in doc.paragraphs)
        return extracted_text
    except Exception as e:
        messagebox.showerror("Erreur", f"Impossible de lire le fichier Word.\n{str(e)}")
        return None

def select_file():
    global text
    file_path = filedialog.askopenfilename(
        filetypes=[("PDF Files", "*.pdf"), ("Word Documents", "*.docx")]
    )
    if file_path:
        if file_path.endswith(".pdf"):
            text = extract_text_from_pdf(file_path)
        elif file_path.endswith(".docx"):
            text = extract_text_from_docx(file_path)
        else:
            messagebox.showerror("Erreur", "Format de fichier non pris en charge.")
            return
        
        if text:
            print("Texte extrait :\n", text)
            messagebox.showinfo("Succès", "Texte extrait avec succès. Consultez la console pour les détails.")
            if messagebox.askyesno("Synthèse vocale", "Voulez-vous convertir le texte en audio ?"):
                synthesize_speech(text)

def synthesize_speech(text):
    os.makedirs("outputs", exist_ok=True)
    output_file = "outputs/VF.wav"
    model_info = MODELS[selected_model]
    
    try:
        tts = TTS(model_name=model_info["name"], progress_bar=True).to(device)
        params = model_info["params"].copy()
        
        if selected_model == "xtts_v2":
            params["speaker"] = selected_speaker
        
        tts.tts_to_file(
            text=text,
            **params,
            file_path=output_file
        )
        
        messagebox.showinfo("Succès", f"Audio généré avec succès et sauvegardé dans {output_file}.")
        print(f"Speech synthesis complete. Audio saved to '{output_file}'.")
    except Exception as e:
        messagebox.showerror("Erreur", f"Erreur lors de la génération de l'audio : {e}")

def change_model(event):
    global selected_model, selected_speaker
    selected_model = model_var.get()
    if selected_model == "xtts_v2":
        speaker_menu["values"] = MODELS[selected_model]["speakers"]
        speaker_menu.current(0)
        selected_speaker = MODELS[selected_model]["speakers"][0]
    else:
        speaker_menu["values"] = []

def change_speaker(event):
    global selected_speaker
    selected_speaker = speaker_var.get()

def create_ui():
    root = tk.Tk()
    root.title("Extraction de texte et Synthèse vocale")
    root.geometry("400x300")

    label = tk.Label(root, text="Sélectionnez un fichier pour extraire le texte :", font=("Arial", 12))
    label.pack(pady=10)

    button = tk.Button(root, text="Sélectionner un fichier", command=select_file, font=("Arial", 12))
    button.pack(pady=5)

    model_label = tk.Label(root, text="Choisissez un modèle de synthèse vocale :", font=("Arial", 10))
    model_label.pack(pady=5)

    global model_var, speaker_var, speaker_menu
    model_var = tk.StringVar(value=selected_model)
    model_menu = ttk.Combobox(root, textvariable=model_var, values=list(MODELS.keys()), state="readonly")
    model_menu.pack(pady=5)
    model_menu.bind("<<ComboboxSelected>>", change_model)
    
    speaker_label = tk.Label(root, text="Choisissez un speaker (xtts_v2) :", font=("Arial", 10))
    speaker_label.pack(pady=5)
    
    speaker_var = tk.StringVar()
    speaker_menu = ttk.Combobox(root, textvariable=speaker_var, values=[], state="readonly")
    speaker_menu.pack(pady=5)
    speaker_menu.bind("<<ComboboxSelected>>", change_speaker)
    
    root.mainloop()

if __name__ == "__main__":
    create_ui()
