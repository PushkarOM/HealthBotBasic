import streamlit as st
import requests
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# Hugging Face API configuration
API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def query(payload):
    """Send text generation request to Hugging Face API."""
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.text}

# Streamlit GUI
def main():
    st.title("Medical Assistance Chatbot")

    # Sidebar for settings
    st.sidebar.header("Settings")
    model_name = st.sidebar.text_input(
        "Model Name (default: flan-t5-small)", value="google/flan-t5-small"
    )
    API_URL = f"https://api-inference.huggingface.co/models/{model_name}"

    # Input for user message
    user_input = st.text_area("Enter your message:", height=100)
    
    if st.button("Send"):
        if user_input.strip() == "":
            st.error("Please enter a message!")
        else:
            with st.spinner("Generating response..."):
                response = query({"inputs": user_input})
                if "error" in response:
                    st.error(f"Error: {response['error']}")
                else:
                    # Display response
                    generated_text = response[0].get("generated_text", "No response")
                    st.success(generated_text)

if __name__ == "__main__":
    main()
