# dashboard/app.py
import streamlit as st
import requests
from pathlib import Path
from pyvis.network import Network
from streamlit_cytoscapejs import st_cytoscapejs



# ======== CONFIG ========
API_URL = "http://127.0.0.1:8000"
st.set_page_config(page_title="NASA SpaceBio Atlas", layout="wide")
st.title("🚀 NASA SpaceBio Atlas — AI-Powered Knowledge Explorer")

# ======== LAYOUT ========
col1, col2 = st.columns([1.2, 1.8], gap="large")

# ---------------------------------------------------------
# 🧠 LEFT COLUMN: AI Q&A PANEL
# ---------------------------------------------------------
with col1:
    st.header("🔍 Ask a Question")

    default_q = st.session_state.get("selected_node_label",
                                 "How does microgravity affect stem cell proliferation?")

    query = st.text_area("Enter your question", default_q, height=100)

    k = st.slider("Context size (k)", 3, 10, 5)

    if st.button("Get Answer", use_container_width=True):
        with st.spinner("💡 Thinking with Gemini..."):
            try:
                resp = requests.post(f"{API_URL}/qa", json={"query": query, "k": k}).json()

                # ---- Display Answer ----
                st.markdown("### 🧩 **Answer**")
                st.markdown(
                    f"<div style='background-color:#f8fafc; padding:15px; border-radius:10px; "
                    f"border-left: 4px solid #3b82f6;'>"
                    f"<p style='font-size:17px; line-height:1.5; color:#1e293b;'>{resp['answer']}</p>"
                    f"</div>",
                    unsafe_allow_html=True
                )

                # ---- Display Context ----
                with st.expander("📚 View Supporting Context"):
                    for c in resp.get("context", []):
                        st.markdown(f"**📄 {c['doc_id']} (Page {c['page']})**")
                        st.markdown(f"<small>{c['text'][:400]}...</small>", unsafe_allow_html=True)
                        st.divider()

            except Exception as e:
                st.error(f"Error: {e}")

# ===============================
# 🔹 KNOWLEDGE GRAPH EXPLORER
# ===============================
import json
from pyvis.network import Network
import streamlit as st
from pathlib import Path
import requests

st.subheader("🧠 Knowledge Graph Explorer")

# ---------- Load Graph Data ----------
graph_path = Path("artifacts/graph_data.json")
if not graph_path.exists():
    st.warning("⚠️ No graph data found at artifacts/graph_data.json")
else:
    with open(graph_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    nodes = data.get("nodes", [])
    edges = data.get("edges", [])

    # Sidebar filters
    st.sidebar.markdown("### 🎛️ Graph Controls")
    view_option = st.sidebar.selectbox(
        "Show category:",
        ["All", "Publications", "Genes", "Processes", "Biological Terms"]
    )
    max_nodes = st.sidebar.slider("Max nodes to display", 10, 150, 60)
    dark_mode = st.sidebar.checkbox("Dark Mode 🌑", value=True)

    def matches_category(node, category):
        nid = node["id"].lower()
        if category == "Publications":
            return "article" in nid
        elif category == "Genes":
            return nid.isupper()
        elif category == "Processes":
            return nid in ["microgravity", "oxidative stress", "stem cells", "apoptosis"]
        elif category == "Biological Terms":
            return not ("article" in nid or nid.isupper())
        return True

    filtered_nodes = [n for n in nodes if matches_category(n, view_option)][:max_nodes]
    filtered_edges = [
        e for e in edges if e["source"] in [n["id"] for n in filtered_nodes]
        and e["target"] in [n["id"] for n in filtered_nodes]
    ]

    # ---------- Build graph ----------
    net = Network(
        height="700px",
        width="100%",
        bgcolor="#0f172a" if dark_mode else "#FFFFFF",
        font_color="white" if dark_mode else "black",
        directed=False
    )

    net.barnes_hut(gravity=-25000, central_gravity=0.3, spring_length=220, spring_strength=0.005)

    for node in filtered_nodes:
        nid = node["id"]
        label = node.get("label", nid)
        if "article" in nid:
            color = "#3b82f6"  # blue for papers
        elif nid.isupper():
            color = "#ec4899"  # pink for genes
        elif nid in ["microgravity", "stem cells", "oxidative stress"]:
            color = "#22c55e"  # green for processes
        else:
            color = "#facc15"  # yellow for terms
        net.add_node(nid, label=label, color=color, title=node.get("title", label))

    for edge in filtered_edges:
        net.add_edge(edge["source"], edge["target"], color="#a855f7", width=2)

    tmp_path = "artifacts/tmp_graph.html"
    net.save_graph(tmp_path)
    st.components.v1.html(open(tmp_path, "r", encoding="utf-8").read(), height=750)

    # ---------- Node insight section ----------
    st.markdown("## 🔬 Analyze a Node with Gemini")
    selected_node = st.selectbox("Select a node to analyze:", [n["id"] for n in filtered_nodes])

    if st.button("Analyze Node"):
        query = f"What are the key biological findings related to '{selected_node}' in space bioscience?"
        with st.spinner("Generating insights..."):
            try:
                resp = requests.post("http://127.0.0.1:8000/qa", json={"query": query, "k": 6}, timeout=120)
                if resp.status_code == 200:
                    answer = resp.json().get("answer", "No insights found.")
                    st.success("✅ Insight generated!")
                    st.markdown(f"### **{selected_node} — Summary**")
                    st.write(answer)
                else:
                    st.error(f"API error: {resp.text}")
            except Exception as e:
                st.error(f"Request failed: {e}")
# -------------------------------------------------------------------
# 📄 Upload Research Paper for AI Insights
# -------------------------------------------------------------------
import fitz  # PyMuPDF

st.markdown("---")
st.header("📄 Upload Research Paper for AI Insights")

uploaded_file = st.file_uploader("Upload a PDF research paper", type=["pdf"])

if uploaded_file is not None:
    st.info(f"Analyzing: {uploaded_file.name}")

    # Extract text from the PDF
    with fitz.open(stream=uploaded_file.read(), filetype="pdf") as doc:
        text = ""
        for page in doc:
            text += page.get_text("text")

    st.success("✅ PDF text extracted successfully!")

    # Ask Gemini (via your FastAPI /qa endpoint) to summarize the paper
    with st.spinner("✨ Generating insights using Gemini..."):
        resp = requests.post(f"{API_URL}/qa", json={
            "query": f"Summarize this paper and extract key insights from it:\n{text[:6000]}",
            "k": 6
        }).json()

    st.markdown("### 🧠 **AI Insights Summary**")
    st.markdown(
        f"<div style='background-color:#f8fafc; padding:15px; border-radius:10px; "
        f"border-left: 4px solid #3b82f6;'>"
        f"<p style='font-size:17px; line-height:1.5; color:#1e293b;'>{resp['answer']}</p>"
        f"</div>",
        unsafe_allow_html=True
    )

    # Optional: Structured breakdown
    st.markdown("### 🧩 Detailed Breakdown")
    sections = [
        ("Abstract / Overview", "Summarize the research problem and main goal."),
        ("Methods", "Explain what experimental or computational methods were used."),
        ("Results", "Summarize the main findings and observations."),
        ("Implications", "Explain how these findings impact space or biological science."),
    ]
    for title, prompt in sections:
        st.markdown(f"#### {title}")
        sub_resp = requests.post(f"{API_URL}/qa", json={
            "query": f"{prompt}\n\n{text[:4000]}",
            "k": 4
        }).json()
        st.markdown(sub_resp["answer"])
