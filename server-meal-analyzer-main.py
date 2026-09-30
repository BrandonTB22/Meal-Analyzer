from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
import tempfile
import json
import openai
import base64
import os

app = Flask(__name__)

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = openai.Client(api_key=OPENAI_API_KEY )

# Main route
@app.route("/")
def index():
    return render_template("meal-analyzer-main.html")

# Upload route
@app.route("/upload", methods=["POST"])
def upload():
    image = request.files["image"]
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    
    # Attempt to save the image to the temporary file
    try:
        image.save(temp_file.name)
        image_path = temp_file.name
        
        with open(image_path, "rb") as food_img:
            base64_img = base64.b64encode(food_img.read()).decode("utf-8")
            
        # Send prompt with image to open ai
        response = client.chat.completions.create(
            model="gpt-4o",
            response_format = {"type" : "json_object"},
            
            messages = [
                {
                    "role" :"system", "content":  
                    """You are a dietician and chef. A user sends 
                    you an image of a meal, and you reply with the restaurant 
                    menu-style name, a savory description and total calories. 
                    Respond in JSON format, with keys called "meal_name", 
                    "meal_description" and "total_calories":
                
                    {{  
                    "meal_name": "name of meal",
                    "meal_description": "description of meal",
                    "total_calories": "total calories in meal”  
                    }}"""
                }, # End system role-content dict
                 
                {"role" : "user", 
                 "content" : [ {"type" : "text",
                                "text" : "Provide information about this meal as a JSON, per the instructions."
                                }, # End user content text dict
                                {
                                    "type" : "image_url",
                                    "image_url" : { "url" :  f"data:image/jpeg; base64, {base64_img}"}
                                }, # Close img_url dict
                        ] # End user content list
                } # End user content text dict
            ] # End messages list
        )
        
        ai_meal_json = response.choices[0].message.content
        print("ai_meal_json", ai_meal_json)
        
        return json.loads(ai_meal_json)
    
    
    except Exception as e:
        return jsonify({"error" : str(e)})

# Allow the app to run
if __name__ == "__main__":
    app.run(debug=True)