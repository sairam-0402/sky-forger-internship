from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_match(student_profile, job_requirements):
    """
    Calculate the match score (0-100) between a student and a job.
    
    student_profile: {
        "skills": ["react", "node", ...],
        "cgpa": 8.5,
        "branch": "Computer Science",
        "resume_text": "Full resume content..."
    }
    
    job_requirements: {
        "skills": ["react", "express", ...],
        "min_cgpa": 7.5,
        "allowed_branches": ["Computer Science", "Electronics & Communication"],
        "description": "Job description text..."
    }
    """
    
    allowed_branches = job_requirements.get("allowed_branches", [])
    student_branch = student_profile.get("branch", "Unknown")
    
    branch_pass = True
    if allowed_branches and len(allowed_branches) > 0:
        
        branch_pass = any(b.lower() in student_branch.lower() or student_branch.lower() in b.lower() for b in allowed_branches)
    
    
    min_cgpa = job_requirements.get("min_cgpa")
    student_cgpa = student_profile.get("cgpa")
    
    cgpa_pass = True
    if min_cgpa is not None and student_cgpa is not None:
        cgpa_pass = float(student_cgpa) >= float(min_cgpa)
        
    
    std_skills = [s.lower() for s in student_profile.get("skills", [])]
    job_skills = [s.lower() for s in job_requirements.get("skills", [])]
    
    skill_match_ratio = 0.0
    if job_skills:
        overlap = set(std_skills).intersection(set(job_skills))
        skill_match_ratio = len(overlap) / len(job_skills)
        
    
    std_text = student_profile.get("resume_text", "")
    if not std_text:
        
        std_text = " ".join(std_skills)
        
    job_desc = job_requirements.get("description", "")
    
    job_text = job_desc + " " + " ".join(job_skills)
    
    cosine_sim = 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf = vectorizer.fit_transform([std_text, job_text])
        cosine_sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
    except Exception as e:
        print(f"Error calculating cosine similarity: {e}")
        
        cosine_sim = skill_match_ratio

    
    
    
    base_score = (cosine_sim * 60.0) + (skill_match_ratio * 40.0)
    
    
    base_score = max(0.0, min(100.0, base_score * 100.0 if base_score <= 1.0 else base_score))
    
    
    meets_criteria = branch_pass and cgpa_pass
    
    
    final_score = base_score
    feedback_notes = []
    
    if not cgpa_pass:
        final_score *= 0.5  
        feedback_notes.append(f"CGPA ({student_cgpa}) is below minimum requirement ({min_cgpa}).")
    if not branch_pass:
        final_score *= 0.4  
        feedback_notes.append(f"Branch ({student_branch}) is not in the allowed list: {', '.join(allowed_branches)}.")
        
    if meets_criteria:
        feedback_notes.append("Meets all minimum eligibility criteria (CGPA and branch).")
        if skill_match_ratio > 0.7:
            feedback_notes.append("Excellent matching skill set!")
        elif skill_match_ratio > 0.3:
            feedback_notes.append("Good skills overlap, matches core requirements.")
        else:
            feedback_notes.append("Some skills overlap; consider upskilling in required technologies.")
    else:
        feedback_notes.append("Does not meet minimum requirements for this position.")

    return {
        "score": round(final_score, 1),
        "meets_criteria": meets_criteria,
        "skills_overlap": list(set(std_skills).intersection(set(job_skills))),
        "missing_skills": list(set(job_skills) - set(std_skills)),
        "feedback": " ".join(feedback_notes)
    }
