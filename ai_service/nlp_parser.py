import re
import os
import spacy
from spacy.matcher import PhraseMatcher
from pypdf import PdfReader
from docx import Document


nlp = spacy.load("en_core_web_sm")


SKILL_LIBRARY = [
    
    "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "php", "go", "rust", "swift", "kotlin", "sql", "html", "css", "r", "matlab",
    
    "react", "angular", "vue", "next.js", "tailwind", "bootstrap", "jquery", "sass", "redux",
    
    "node.js", "express", "django", "flask", "fastapi", "spring boot", "postgresql", "mysql", "mongodb", "sqlite", "redis", "oracle", "prisma", "sequelize",
    
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "jenkins", "ci/cd", "terraform", "linux",
    
    "machine learning", "deep learning", "artificial intelligence", "data science", "nlp", "computer vision", "spacy", "scikit-learn", "tensorflow", "pytorch", "pandas", "numpy", "matplotlib", "seaborn", "tableau", "power bi",
    
    "rest api", "graphql", "microservices", "agile", "scrum", "system design", "data structures", "algorithms"
]

def extract_text_from_pdf(pdf_path):
    """Extract all text page-by-page from a PDF resume."""
    text = ""
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_text_from_docx(docx_path):
    """Extract all text paragraph-by-paragraph from a DOCX resume."""
    text = ""
    try:
        doc = Document(docx_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
    return text

def parse_resume(file_path):
    """Parse resume to extract text, CGPA, Branch, and Skills."""
    _, ext = os.path.splitext(file_path.lower())
    
    if ext == '.pdf':
        text = extract_text_from_pdf(file_path)
    elif ext in ['.docx', '.doc']:
        text = extract_text_from_docx(file_path)
    else:
        text = ""

    if not text:
        return {
            "text": "",
            "skills": [],
            "cgpa": None,
            "branch": "Unknown"
        }

    
    cleaned_text = re.sub(r'\s+', ' ', text)

    
    cgpa = extract_cgpa(cleaned_text)

    
    branch = extract_branch(cleaned_text)

    
    skills = extract_skills(text)

    return {
        "text": text,
        "skills": skills,
        "cgpa": cgpa,
        "branch": branch
    }

def extract_cgpa(text):
    """Regex matching for typical CGPA representations."""
    
    patterns = [
        r'(?:cgpa|gpa)\s*(?:of|is|:)?\s*([0-9]\.[0-9]{1,2})\b', 
        r'\b([0-9]\.[0-9]{1,2})\s*/\s*10\b',                   
        r'\b([0-9]\.[0-9]{1,2})\s*(?:cgpa|gpa)\b',             
        r'\b(10\.00|10\.0|10)\s*(?:cgpa|gpa)\b',
        r'\b([6-9]\.[0-9]{1,2})\b'                             
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            try:
                val = float(matches[0])
                if 0.0 <= val <= 10.0:
                    return val
            except ValueError:
                continue
    return None

def extract_branch(text):
    """Classify the candidate branch based on standard engineering acronyms/keywords."""
    text_lower = text.lower()
    
    branch_map = {
        "Computer Science": ["computer science", "cse", "cs", "information science", "ise", "is", "information technology", "it"],
        "Electronics & Communication": ["electronics", "ece", "telecommunication", "etc"],
        "Electrical & Electronics": ["electrical", "eee"],
        "Mechanical Engineering": ["mechanical", "mech", "me"],
        "Civil Engineering": ["civil", "cv"]
    }
    
    for branch, keywords in branch_map.items():
        for kw in keywords:
            
            if len(kw) <= 4:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    return branch
            else:
                if kw in text_lower:
                    return branch
                    
    return "Computer Science" 

def extract_skills(text):
    """Extract skills matching our predefined skill library using spaCy PhraseMatcher."""
    doc = nlp(text.lower())
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    
    
    patterns = [nlp.make_doc(skill) for skill in SKILL_LIBRARY]
    matcher.add("SKILLS", patterns)
    
    matches = matcher(doc)
    extracted = set()
    for match_id, start, end in matches:
        span = doc[start:end]
        
        matched_text = span.text
        
        for skill in SKILL_LIBRARY:
            if skill.lower() == matched_text.lower():
                extracted.add(skill)
                break
                
    
    text_lower = text.lower()
    for skill in SKILL_LIBRARY:
        if len(skill) > 3: 
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                extracted.add(skill)
        else:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                extracted.add(skill)

    return sorted(list(extracted))
