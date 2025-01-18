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

# Function to query the Hugging Face model
def query(payload):
    """Send text generation request to Hugging Face API."""
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.text}

# Function to reset the input box
def reset_input():
    """Resets the text input field."""
    st.session_state["input_text"] = ""

# Streamlit GUI
def main():
    st.title("Medical Assistance Chatbot")

    # Sidebar for settings
    st.sidebar.header("Settings")
    model_name = st.sidebar.text_input(
        "Model Name (default: meta-llama/Meta-Llama-3-8B-Instruct)", value="meta-llama/Meta-Llama-3-8B-Instruct"
    )
    API_URL = f"https://api-inference.huggingface.co/models/{model_name}"

    # Initialize chat history if not already present in session state
    if "messages" not in st.session_state:
        st.session_state.messages = []

    # Display the conversation so far
    for msg in st.session_state.messages:
        if msg["role"] == "user":
            st.markdown(f"**You**: {msg['content']}")
        else:
            st.markdown(f"**Bot**: {msg['content']}")

    # Input for user message
    user_input = st.text_area("Type your message here:", height=100)

    if st.button("Send"):
        if user_input.strip() == "":
            st.error("Please enter a message!")
        else:
            # Add the user's message to chat history
            st.session_state.messages.append({"role": "user", "content": user_input})

            with st.spinner("Generating response..."):
                # Query the model for a response
                response = query({"inputs": user_input})
                if "error" in response:
                    st.error(f"Error: {response['error']}")
                else:
                    # Extract and display the bot's response
                    generated_text = response[0].get("generated_text", "No response generated.")
                    st.session_state.messages.append({"role": "bot", "content": generated_text})
                    st.success(generated_text)
                    reset_input()  # Reset the input text box

if __name__ == "__main__":
    main()
