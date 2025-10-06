import fitz  # PyMuPDF
import requests
import streamlit as st

API_URL = "http://127.0.0.1:8000"

st.header("📄 Upload Research Paper for AI Insights")

uploaded_file = st.file_uploader("Upload a PDF paper", type=["pdf"])

if uploaded_file is not None:
    st.info(f"Analyzing: {uploaded_file.name}")

    # Extract text from PDF
    with fitz.open(stream=uploaded_file.read(), filetype="pdf") as doc:
        text = ""
        for page in doc:
            text += page.get_text("text")

    st.success("✅ PDF text extracted successfully!")

    # --- send to Gemini summarizer endpoint ---
    with st.spinner("Generating insights using Gemini..."):
        resp = requests.post(f"{API_URL}/qa", json={
            "query": f"Summarize this paper and extract key insights from it:\n{text[:5000]}",
            "k": 6
        }).json()

    st.markdown("### 🧩 **AI Insights**")
    st.markdown(
        f"<div style='background-color:#f1f5f9; padding:20px; border-radius:10px;'>"
        f"<p style='font-size:17px; line-height:1.5;'>{resp['answer']}</p>"
        f"</div>",
        unsafe_allow_html=True
    )

    # Optional: structured breakdown
    st.markdown("### 📊 **Structured Summary**")
    with st.expander("Detailed Breakdown"):
        sections = [
            ("**Abstract/Overview**", "Summarize the research problem and goals."),
            ("**Methods**", "Explain what techniques or models were used."),
            ("**Results**", "Summarize the findings in quantitative or qualitative form."),
            ("**Implications**", "Explain how these findings impact space biology or medicine."),
        ]
        for title, prompt in sections:
            st.markdown(title)
            res = requests.post(f"{API_URL}/qa", json={
                "query": f"{prompt}\n\n{text[:4000]}",
                "k": 6
            }).json()
            st.markdown(f"<p>{res['answer']}</p>", unsafe_allow_html=True)
