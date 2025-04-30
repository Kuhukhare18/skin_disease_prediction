from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware  # CORS Handling
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import io
from model_architecture import SkinDiseaseCNN  # Ensure model is correctly defined
import json
import requests
from bs4 import BeautifulSoup

app = FastAPI()

# Enable CORS (for frontend integration)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🚨 Add this below app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 👈 React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Skin Disease Prediction Model
model = SkinDiseaseCNN()
model_path = "model.pth"

try:
    state_dict = torch.load(model_path, map_location=torch.device('cpu'))
    model.load_state_dict(state_dict, strict=False)  # Allow missing keys
    model.eval()
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# Image Preprocessing
transform = transforms.Compose([
    transforms.Resize((64, 64)),  # Resize to match input size
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5]), 
])

# Skin Disease Labels
class_labels = [
    'Acne and Rosacea Photos', 
    'Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions',
    'Atopic Dermatitis Photos', 
    'Bullous Disease Photos', 
    'Cellulitis Impetigo and other Bacterial Infections', 
    'Eczema Photos', 
    'Exanthems and Drug Eruptions', 
    'Hair Loss Photos Alopecia and other Hair Diseases', 
    'Herpes HPV and other STDs Photos', 
    'Light Diseases and Disorders of Pigmentation', 
    'Lupus and other Connective Tissue diseases', 
    'Melanoma Skin Cancer Nevi and Moles', 
    'Nail Fungus and other Nail Disease', 
    'Poison Ivy Photos and other Contact Dermatitis', 
    'Psoriasis pictures Lichen Planus and related diseases', 
    'Scabies Lyme Disease and other Infestations and Bites', 
    'Seborrheic Keratoses and other Benign Tumors', 
    'Systemic Disease', 
    'Tinea Ringworm Candidiasis and other Fungal Infections', 
    'Urticaria Hives', 
    'Vascular Tumors', 
    'Vasculitis Photos', 
    'Warts Molluscum and other Viral Infections'
]

# Doctor Recommendations Based on Disease
doctor_recommendations = {
    "Psoriasis pictures Lichen Planus and related diseases": ["Dr. Sharma", "Dr. Verma"],
    "Acne and Rosacea Photos": ["Dr. Gupta", "Dr. Reddy"],
    "Eczema Photos": ["Dr. Patel", "Dr. Mehta"],
    "Cellulitis Impetigo and other Bacterial Infections": ["Dr. Singh", "Dr. Bose"],
    "Bullous Disease Photos": ["Dr. Khan", "Dr. Das"],
}

# Web Scraping for Doctor List

@app.get("/doctors/")
def get_doctors():
    try:
        with open("doctors.json", "r") as file:
            doctors = json.load(file)

        print("✅ API Response:", doctors)  # Debugging
        return {"doctors": doctors}
    
    except Exception as e:
        print(f"❌ Error fetching doctors: {e}")
        return {"error": str(e)}

    
    soup = BeautifulSoup(response.text, "html.parser")
    doctor_list = []

    doctor_cards = soup.find_all("div", class_="doctor-card")  # Modify class name if needed

    for doctor in doctor_cards:
        name = doctor.find("h3").text.strip() if doctor.find("h3") else "Unknown"
        specialization = doctor.find("p", class_="specialization").text.strip() if doctor.find("p", class_="specialization") else "Not available"
        phone = doctor.find("p", class_="contact").text.strip() if doctor.find("p", class_="contact") else "No contact"
        city = doctor.find("p", class_="location").text.strip() if doctor.find("p", class_="location") else "Unknown city"

        doctor_list.append({
            "name": name,
            "specialization": specialization,
            "phone": phone,
            "city": city
        })

    return {"doctors": doctor_list}

# Prediction API
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        # Read and process image
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
        image = transform(image).unsqueeze(0)  # Add batch dimension
        

        # Predict
        with torch.no_grad():
            output = model(image)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top2_probs, top2_indices = torch.topk(probabilities, 2)

            disease_1 = class_labels[top2_indices[0].item()]
            confidence_1 = round(top2_probs[0].item() * 100, 2)

            disease_2 = class_labels[top2_indices[1].item()]
            confidence_2 = round(top2_probs[1].item() * 100, 2)
            print(f"Predicted raw output: {output}")
            print(f"Probabilities: {probabilities}")
            print(f"Top classes: {disease_1} ({confidence_1}%), {disease_2} ({confidence_2}%)")

            


        return {
            "disease": disease_1,
            "confidence": confidence_1,
            "alternative_disease": disease_2,
            "alternative_confidence": confidence_2,
            "recommended_doctors": doctor_recommendations.get(disease_1, ["General Dermatologist"])
        }

    except Exception as e:
        return {
        "disease": None,
        "confidence": None,
        "alternative_disease": None,
        "alternative_confidence": None,
        "recommended_doctors": [],
        "error": str(e)
    }
    if image.size[0] < 20 or image.size[1] < 20:
        return {"error": "Uploaded image too small or corrupted"}


@app.get("/")
def home():
    return {"message": "Skin Disease Prediction API is running 🚀"}

    