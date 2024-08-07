import os
import streamlit as st
from st_audiorec import st_audiorec
from fpdf import FPDF
import whisper
from ai71 import AI71
import base64
from datetime import date

user_name = 'Anonymous'
# Custom CSS to modify the UI/UX
st.markdown(
    """
    <style>
    .css-1egvi7u {margin-top: -3rem;}
    .stAudio {height: 45px;}
    .css-v37k9u a {color: #ff4c4b;}
    .css-nlntq9 a {color: #ff4c4b;}
    .reportview-container {
        background: url('background_image.jpg');
        background-size: cover;
    }
    .logo {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        bottom: 10px;
        width: 100%;
    }
    .logo img {
        max-width: 150px;
    }
    </style>
    """,
    unsafe_allow_html=True
)


# Path to the logo image
logo_path  = "assets/logo.png"  # Update this with the correct path to your logo image

# Function to display logo
def display_logo():
    if os.path.exists(logo_path):
        with open(logo_path, "rb") as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode()
        st.markdown(
            f'<div class="logo"><img src="data:image/png;base64,{encoded_image}" alt="Logo"></div>',
            unsafe_allow_html=True,
        )


# List of image URLs or paths
image_urls = [
    "assets/1.png",
    "assets/2.png",
    "assets/3.png",
    "assets/4.png",
    "assets/5.png"
]

# Initialize session state
if 'page' not in st.session_state:
    st.session_state.page = 0
if 'recordings' not in st.session_state:
    st.session_state.recordings = [None] * len(image_urls)

# Load Whisper model
model = whisper.load_model("base")  # Use "base.en" for English-only

# Save audio file locally
def save_audio(audio_data, index):
    file_path = f"recording_{index + 1}.wav"
    with open(file_path, "wb") as f:
        f.write(audio_data)
    return file_path

# Transcribe audio using Whisper
def transcribe_audio(file_path):
    audio = whisper.load_audio(file_path)
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    options = whisper.DecodingOptions(language="english", task="transcribe")
    result = model.decode(mel, options)
    return result.text

# Generate personality assessment report using AI71
def generate_assessment_report(transcription, user_name):
    AI71_API_KEY = "api71-api-e096bd6a-ce4d-438a-8b61-84b82d45fa78"

    # Define the prompt and input
    prompt = f"""
    Convert the following story into a personality assessment report, don't include stories, it should follow the format provided. Customize the report for the user named {user_name}:
    Story: {transcription}

    Format:
    
    Disclaimer: This is an AI-generated report and should be validated with a professional clinical psychologist.

    Overall Score: give an overall score
    give a Summary of Traits from story analysis

    Date: {date.today().strftime("%B %d, %Y")}

    Personality Traits:
    Trait                         Rating (1-5)
    Resilience                   
    Optimism                     
    Thoughtfulness               
    Emotional Sensitivity        
    Adaptability                 
    Social Support               
    Problem-Solving              
    Creativity                   
    Leadership                  
    Independence                 
    Empathy                      

    Motivation                   
    Self-Discipline              
    Confidence                   
    Communication Skills         

    Key Observations after the Story analysis:
    Give key observations here from the story analysis

    Personality Summary:
    Give a brief summary about the psychology from the story analysis

    Recommendations for Improvement:
    * give a recommendation from the story
    * give another recommendation from the story

    How Will This Analysis Help {user_name} Succeed in Life:
    * give a success point from the story
    * give another success point from the story
    """
    system_prompt = '''You are a skilled psychology expert specializing in personality assessments. 
    Your task is to analyze stories provided by users, which are based on images they have seen. 
    Based on the narrative content of these stories, generate a detailed psychology assessment report.
    Include evaluations of personality traits, emotional states, and other psychological aspects relevant to the story. 
    Present your findings in a clear, professional format, offering insights and recommendations where applicable.'''

    client = AI71(AI71_API_KEY)

    response = client.chat.completions.create(
        model="tiiuae/falcon-180B-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
    )

    return response.choices[0].message.content.strip()

# Create PDF report with the personality assessmen


class PDF(FPDF):
    def __init__(self, report_text, user_name, log_text):
        super().__init__()
        self.report_text = report_text
        self.user_name = user_name
        self.log_text = log_text

    def header(self):
        self.image("assets/logo.png" , x=180, y=10, w=20)
        self.set_font("Arial", 'B', 16)
        self.cell(0, 10, "PERSONALITY ASSESSMENT REPORT", 0, 1, 'C')
        self.set_font("Arial", size=12)
        self.cell(0, 10, f"Assessment for: {self.user_name}", 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)  # Position at 1.5 cm from bottom
        self.set_font("Arial", 'I', 8)
        self.cell(0, 10, self.log_text, 0, 0, 'C')
        
    def add_report(self):
        self.add_page()
        self.set_font("Arial", size=12)
        self.multi_cell(0, 10, self.report_text.encode('latin1', 'replace').decode('latin1'))

def create_pdf_report(report_text, user_name, log_text="ThinkingPsychologist - Powered By Falcon LLM"):
    pdf = PDF(report_text, user_name, log_text)
    pdf.add_report()
    pdf_output = "psychology_assessment_report.pdf"
    pdf.output(pdf_output)
    return pdf_output

# Introductory Page
def intro():
    display_logo()
    st.title("Welcome to ThinkingPsychologist")
    st.subheader("Take your psychology assessment")
    st.video("https://youtu.be/uBK8kgdXAnE", start_time=0)
    st.markdown(
        """
        This app helps to understand the psychology of individuals by asking them
        to create stories for different images. You will see a series of images and
        you are supposed to record a story based on each image.
        
        **Click "Start" to start the assessment.**
        """
    )
    st.write("### 📜 Instructions")
    st.write("You will be shown a series of 10 images. 🖼️")
    st.write("For each image, you need to create a dramatic story. 🎭")
    st.write("1. Describe what is happening in the picture. 📸")
    st.write("2. What led up to the current situation. 🕒")
    st.write("3. What the characters are thinking and feeling. 💭")
    st.write("4. How the situation will resolve. 🌟")
    
    st.session_state.page = 1
    st.button("Start")
    st.markdown(
        """
        ---
        ⚠️ **Important Notice: Handling Streamlit Cloud Limits**
        If the app is not working or crashing due to Streamlit Cloud's limitations, we suggest using the text-story-input branch. This will allow you to input the story in text format, which will not crash or throw memory errors due to the cloud's constraints.

        **The new link for text input**: [Text input App link](https://thinkingpsychologist-dpfclbx99uuzamqfmejxhz.streamlit.app/)
        """
    )        

# Recording Page
def recording_page():
    current_image_index = st.session_state.page - 1
    display_logo()

    #col1, col2 = st.columns([4, 2])
    #with col1:
    st.image(image_urls[current_image_index], use_column_width=True)
    #with col2:
    st.write("Please tell a story about this image.")
    st.write("Click '**Start Recording**' to record your story, '**Stop**' to end it, '**Submit**' to send it (wait for the successful submit message), and use '**Start Recording**' for the **next** image")


    col1, col2 = st.columns([4, 2])
    with col1:
        wav_audio_data = st_audiorec()
    with col2:
        col11, col12 = st.columns([1, 5])
# Place the button in the center column 
        with col12:
            st.write("")  # Add some space
            st.write("")  # Add more space if needed
            st.write("")  # Add additional space if necessary
            st.write("")  # Add even more space if needed
            if st.button("Submit"):       
                save_audio(wav_audio_data, current_image_index)
                st.session_state.recordings[current_image_index] = wav_audio_data
                st.session_state.page += 1
                st.success("Recording saved successfully. Press '**Start Recording**' for the next task.")
    



# Final Page
def final_page():
    display_logo()
    st.title("Thank you for completing the assessment! 🧠✨")
    st.subheader("Download your psychology assessment report")
    st.write("Please be patient while the download button is being prepared. It may take a moment.")
    

    
    st.write(
        """
        Please consult with a psychologist using this report for a better understanding of your results. Your insights and reflections are valuable for your personal growth and well-being.
        
        _"The greatest discovery of my generation is that a human being can alter his life by altering his attitudes."_ — William James
        """
    )
    
    st.write("📥 You can find your report here once the analysis is complete")
    user_name = st.text_input("Enter your name:", "Anonymous")  # Get user's name
    combined_transcription = ""
    for i, recording in enumerate(st.session_state.recordings):
        if recording:
            file_path = save_audio(recording, i)
            transcription = transcribe_audio(file_path)
            combined_transcription += f"Story {i + 1}: {transcription}\n\n"

    report_text = generate_assessment_report(combined_transcription, user_name)
    pdf_output = create_pdf_report(report_text, user_name)

    with open(pdf_output, "rb") as pdf_file:
        st.download_button(label="Download Report", data=pdf_file, file_name=pdf_output, mime="application/pdf")

    st.session_state.page = 0
    if st.button("Start Over"):
        st.session_state.recordings = [None] * len(image_urls)


    


# Page routing logic
def main():
    if st.session_state.page == 0:
        intro()
    elif 1 <= st.session_state.page <= len(image_urls):
        recording_page()
    else:
        final_page()

if __name__ == "__main__":
    main()
