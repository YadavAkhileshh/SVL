from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
import re
import requests
from typing import List, Dict
import json
import os
import time
from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv
import google.generativeai as genai
from youtubesearchpython import VideosSearch
import ast

load_dotenv()

app = FastAPI(title="SVL Smart Video Learner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

video_contexts = {}
rate_limit_tracker = {}

class VideoRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    video_id: str
    message: str

class GenerateFlashcardsRequest(BaseModel):
    video_id: str
    count: int = 5

class GenerateQuizRequest(BaseModel):
    video_id: str
    count: int = 5
    difficulty: str = "medium"

class LearnRequest(BaseModel):
    topic: str

class CodeTreeRequest(BaseModel):
    language: str

class CodeResourcesRequest(BaseModel):
    language: str
    topic: str

class CodeChatRequest(BaseModel):
    language: str
    topic: str
    message: str

class ExplainFlashcardRequest(BaseModel):
    video_id: str
    term: str
    definition: str

class MindMapRequest(BaseModel):
    video_id: str

class InfographicRequest(BaseModel):
    video_id: str

class StudyMaterial(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    video_id: str
    title: str
    topic: str
    transcript: str
    video_summary: str
    detailed_explanation: str
    key_points: List[str]
    flashcards: List[Dict[str, str]]
    quiz_questions: List[Dict]

def extract_video_id(url: str) -> str:
    patterns = [
        r'(?:youtube\.com/watch\?v=)([a-zA-Z0-9_-]{11})',
        r'(?:youtu\.be/)([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError("Invalid YouTube URL")

def get_video_metadata(video_id: str) -> Dict:
    try:
        response = requests.get(
            f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json",
            timeout=10
        )
        if response.status_code == 200:
            return {"title": response.json().get("title", "Educational Video")}
    except:
        pass
    return {"title": "Educational Content"}

def get_transcript(video_id: str) -> str:
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        for transcript in transcript_list:
            try:
                data = transcript.fetch()
                text = " ".join([entry['text'] for entry in data])
                # Clean control characters
                text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
                text = ' '.join(text.split())  # Remove extra spaces
                return text.strip()
            except Exception as e:
                print(f"Transcript fetch error: {e}")
                continue
    except Exception as e:
        print(f"Transcript list error: {e}")
    return ""

def call_ai_with_fallback(prompt: str) -> str:
    """Try Groq -> OpenAI -> Gemini"""
    
    # Try Groq
    if GROQ_API_KEY:
        print("→ Trying Groq...")
        for attempt in range(2):
            try:
                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 16000,
                        "temperature": 0.2
                    },
                    timeout=60
                )
                if response.status_code == 200:
                    result = response.json()["choices"][0]["message"]["content"].strip()
                    print(f"✓ Groq success ({len(result)} chars)")
                    return result
            except Exception as e:
                print(f"⚠ Groq attempt {attempt+1} failed: {str(e)[:100]}")
                time.sleep(3)
    
    # Try OpenAI
    if OPENAI_API_KEY:
        print("→ Trying OpenAI...")
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 16000,
                    "temperature": 0.2
                },
                timeout=60
            )
            if response.status_code == 200:
                result = response.json()["choices"][0]["message"]["content"].strip()
                print(f"✓ OpenAI success ({len(result)} chars)")
                return result
        except Exception as e:
            print(f"⚠ OpenAI failed: {str(e)[:200]}")
    
    # Try Gemini
    if GEMINI_API_KEY:
        print("→ Trying Gemini...")
        try:
            response = requests.post(
                f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 16000}
                },
                timeout=60
            )
            if response.status_code == 200:
                result = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                print(f"✓ Gemini success ({len(result)} chars)")
                return result
        except Exception as e:
            print(f"⚠ Gemini failed: {str(e)[:200]}")
    
    print("✗ All AI APIs failed")
    return ""

def extract_topic(title: str, transcript: str) -> str:
    title_lower = title.lower()
    patterns = {
        'lenz': "Lenz's Law", 'fleming': "Fleming's Left Hand Rule",
        'thermodynamics': "Laws of Thermodynamics", 'photosynthesis': "Photosynthesis",
        'mitosis': "Mitosis", 'meiosis': "Meiosis", 'zeroth': "Zeroth Law of Thermodynamics"
    }
    for pattern, topic in patterns.items():
        if pattern in title_lower:
            return topic
    
    if transcript:
        content = f"Title: {title}\n\nTranscript: {transcript[:2000]}"
    else:
        content = f"Title: {title}"
    
    prompt = f'Extract the educational topic from this video. Return ONLY the topic name.\n\n{content}\n\nTopic:'
    topic = call_ai_with_fallback(prompt)
    if topic and 3 < len(topic) < 100:
        return topic.strip('"').strip("'").strip()
    return title[:50]

def generate_content_with_ai(topic: str, title: str, transcript: str) -> Dict:
    if transcript and len(transcript) > 100:
        context = f"Video: {title}\n\nTranscript:\n{transcript[:8000]}"
        instruction = "Based on the video transcript, create comprehensive study materials."
    else:
        # No transcript or very short - use AI knowledge about the topic
        context = f"Video: {title}\nTopic: {topic}"
        instruction = f"Based on your knowledge of {topic}, create comprehensive educational study materials. Use the video title '{title}' for context. Generate complete, accurate educational content including specific examples, formulas, principles, and applications related to {topic}."
    
    prompt = f"""{instruction}

{context}

Create EXCEPTIONAL, NotebookLM-quality comprehensive study materials about {topic}.

Generate EXACTLY this JSON structure with OUTSTANDING quality:

{{
  "video_summary": "Write 300-400 words. Structure: 
    - Opening (2 sentences): Hook + What is {topic}
    - Core Explanation (3-4 sentences): Main concepts, principles, mechanisms
    - Significance (2-3 sentences): Why it matters, real-world impact
    - Key Applications (2-3 sentences): Where it's used, practical examples
    - Conclusion (1-2 sentences): Takeaway message
    Make it engaging, informative, and comprehensive like NotebookLM.",
    
  "detailed_explanation": "Write 2500-3000 words in 8-10 detailed sections. Use ONLY plain text without any markdown formatting. No asterisks, no hashtags, no special symbols. Write section titles followed by colons, then paragraphs of plain text:
    
    ## Introduction (200 words)
    - What is {topic}? Define clearly
    - Historical context and discovery
    - Why it's important to understand
    
    ## Fundamental Concepts (300 words)
    - Core principles and theories
    - Key terminologies and definitions
    - Foundational formulas/equations with explanations
    - Visual descriptions (if applicable)
    
    ## Detailed Mechanism (400 words)
    - Step-by-step process breakdown  
    - How it works in detail
    - Underlying physics/chemistry/biology
    - Cause and effect relationships
    
    ## Mathematical Framework (300 words - if applicable)
    - All relevant equations
    - Variable explanations
    - Derivations and proofs
    - Example calculations
    
    ## Real-World Examples (400 words)
    - Example 1: Detailed scenario with numbers/data
    - Example 2: Different domain/application
    - Example 3: Modern technology use case
    
    ## Practical Applications (300 words)
    - Industrial applications
    - Technology implementations  
    - Day-to-day occurrences
    - Future potential
    
    ## Common Misconceptions (200 words)
    - What people often get wrong
    - Why these misconceptions exist
    - Correct understanding
    
    ## Advanced Insights (300 words)
    - Deeper understanding
    - Recent research/developments
    - Connections to other concepts
    - Expert-level knowledge
    
    ## Problem-Solving Approaches (300 words)
    - How to solve problems involving {topic}
    - Step-by-step methodologies
    - Tips and tricks
    
    ## Conclusion and Key Takeaways (200 words)
    - Summary of most important points
    - What you absolutely must remember
    - Next steps for learning
    
    Use clear headings (##), bullet points, numbered lists, and **bold** for emphasis.",
    
  "key_points": [
    "🎯 **Core Concept:** Provide comprehensive definition of {topic} with fundamental principle, formula/equation if applicable, and why it's foundational. Include 2-3 specific examples demonstrating the concept. (100-120 words)",
    
    "⚙️ **How It Works:** Detailed step-by-step mechanism breakdown with technical precision. Explain each phase/stage with what happens, why it happens, and the result. Include cause-effect relationships and process flow. (100-120 words)",
    
    "🌍 **Real-World Example 1:** Specific, detailed real-life scenario with actual numbers, measurements, or data. Explain the context, what's happening, and why {topic} is relevant here. Make it relatable and memorable. (100-120 words)",
    
    "🌍 **Real-World Example 2:** Another detailed example from a completely different domain/field. Include specific details, context, and explanation of how {topic} applies. Use different scale/perspective than example 1. (100-120 words)",
    
    "💡 **Practical Applications:** Describe 3-4 major technology/industry applications with specifics. Include modern innovations, commercial products, or systems that rely on {topic}. Explain how it's implemented. (100-120 words)",
    
    "📐 **Mathematical/Technical Details:** If applicable, explain the key formula/equation/principle with all variables defined, typical values, and what each term represents. Include example calculation or technical specifications. (100-120 words)",
    
    "⚠️ **Common Misconceptions:** Explain 2-3 things people commonly misunderstand about {topic}. For each: what the misconception is, why people believe it, what the truth is, and why the distinction matters. (100-120 words)",
    
    "🔬 **Advanced Insight:** Share deeper understanding that goes beyond basics. Include recent research, cutting-edge developments, expert-level knowledge, or connections to other advanced concepts. What do professionals/researchers know that beginners don't? (100-120 words)"
  ],
  
  "flashcards": [
    {{"term": "What is {topic}?", "definition": "Comprehensive yet concise definition covering the essence, key principle, and primary significance. Include context. (50-60 words)", "difficulty": "beginner"}},
    {{"term": "Key Principle of {topic}", "definition": "Main governing principle or law with explanation of how it works and why it's important. (50-60 words)", "difficulty": "beginner"}},
    {{"term": "How does {topic} work?", "definition": "Step-by-step mechanism explanation covering the process from start to finish with key stages identified. (50-60 words)", "difficulty": "intermediate"}},
    {{"term": "Primary Formula/Equation", "definition": "Main mathematical relationship with all variables defined and physical meaning explained. (50-60 words)", "difficulty": "intermediate"}},
    {{"term": "Real-World Application 1", "definition": "Specific technology or natural occurrence where {topic} is demonstrated with context and explanation. (50-60 words)", "difficulty": "intermediate"}},
    {{"term": "Real-World Application 2", "definition": "Another distinct example from different domain showing practical use with details. (50-60 words)", "difficulty": "intermediate"}},
    {{"term": "Common Misconception", "definition": "What people often get wrong about {topic}, why the misconception exists, and what the correct understanding is. (50-60 words)", "difficulty": "intermediate"}},
    {{"term": "Advanced Concept", "definition": "Deeper insight or advanced aspect of {topic} that requires understanding of basics. Expert-level knowledge. (50-60 words)", "difficulty": "advanced"}},
    {{"term": "Related Concept 1", "definition": "How {topic} connects to or differs from related concept with specific distinctions explained. (50-60 words)", "difficulty": "advanced"}},
    {{"term": "Historical Context", "definition": "Discovery, development, or evolution of understanding {topic} with key contributors or breakthroughs mentioned. (50-60 words)", "difficulty": "beginner"}},
    {{"term": "Problem-Solving Strategy", "definition": "Approach to solving problems involving {topic} with step-by-step methodology or key considerations. (50-60 words)", "difficulty": "advanced"}},
    {{"term": "Future/Modern Development", "definition": "Recent research, new applications, or cutting-edge developments related to {topic} with implications explained. (50-60 words)", "difficulty": "advanced"}}
  ],
  
  "quiz_questions": [
    {{"id": 1, "question": "Conceptual Understanding: {topic} question testing fundamental grasp", "type": "multiple_choice", "options": ["Correct comprehensive answer", "Plausible but incomplete", "Common misconception", "Clearly wrong"], "correct": 0, "explanation": "Detailed explanation why correct answer is right and others are wrong (40-50 words)", "difficulty": "easy"}},
    
    {{"id": 2, "question": "True or False: Statement testing common misconception about {topic}", "type": "true_false", "correct": false, "explanation": "Why this is true/false with context and clarification (40-50 words)", "difficulty": "easy"}},
    
    {{"id": 3, "question": "Application Scenario: Real-world situation requiring understanding of how {topic} works", "type": "multiple_choice", "options": ["Correct application", "Misapplication 1", "Misapplication 2", "Wrong context"], "correct": 0, "explanation": "Why this approach works and others don't (40-50 words)", "difficulty": "medium"}},
    
    {{"id": 4, "question": "Formula/Calculation: Problem requiring use of key equation with given values", "type": "multiple_choice", "options": ["Correct answer with units", "Wrong formula used", "Calculation error", "Unit error"], "correct": 0, "explanation": "Step-by-step solution showing correct approach (40-50 words)", "difficulty": "medium"}},
    
    {{"id": 5, "question": "Compare/Contrast: How does {topic} differ from related concept?", "type": "multiple_choice", "options": ["Accurate distinction", "Partial similarity", "Confused with other concept", "Opposite relationship"], "correct": 0, "explanation": "Clear explanation of actual relationship and differences (40-50 words)", "difficulty": "medium"}},
    
    {{"id": 6, "question": "True or False: Advanced statement testing deep understanding of {topic}", "type": "true_false", "correct": true, "explanation": "Detailed reasoning and context for this truth (40-50 words)", "difficulty": "hard"}},
    
    {{"id": 7, "question": "Multi-Step Analysis: Complex scenario requiring multiple aspects of {topic} knowledge", "type": "multiple_choice", "options": ["Complete correct analysis", "Missed key factor", "Wrong principle applied", "Incomplete reasoning"], "correct": 0, "explanation": "Comprehensive breakdown of what makes this correct (40-50 words)", "difficulty": "hard"}},
    
    {{"id": 8, "question": "Advanced Application: Cutting-edge or expert-level question about {topic}", "type": "multiple_choice", "options": ["Sophisticated correct answer", "Oversimplified approach", "Beginner understanding", "Misconception-based"], "correct": 0, "explanation": "Expert-level explanation with advanced insights (40-50 words)", "difficulty": "hard"}},
    
    {{"id": 9, "question": "Problem-Solving: Given situation, what's the best approach using {topic}?", "type": "multiple_choice", "options": ["Optimal strategy", "Suboptimal but workable", "Inefficient approach", "Wrong method"], "correct": 0, "explanation": "Why this strategy is best with reasoning (40-50 words)", "difficulty": "hard"}},
    
    {{"id": 10, "question": "True or False: Nuanced statement requiring careful consideration of {topic} details", "type": "true_false", "correct": true, "explanation": "Careful analysis of why this is true/false with nuance explained (40-50 words)", "difficulty": "medium"}}
  ]
}}

CRITICAL REQUIREMENTS:
1. key_points MUST be array of 8 STRINGS (not objects), each starting with emoji
2. flashcards: Generate 12 cards with progressive difficulty (beginner → advanced)
3. quiz_questions: Generate 10 diverse questions mixing easy/medium/hard
4. Make ALL content DETAILED, COMPREHENSIVE, and PROFESSIONAL
5. Use specific examples with real numbers/data
6. Include formulas, equations, technical specs where applicable
7. Write at NotebookLM quality level - exceptional depth and clarity
8. Return ONLY valid JSON, no markdown, no explanations"""

    response = call_ai_with_fallback(prompt)
    
    if response:
        try:
            print(f"Raw response preview: {response[:200]}...")
            cleaned = response.strip()
            
            # Extract JSON from markdown code blocks
            if '```json' in cleaned:
                cleaned = cleaned.split('```json')[1].split('```')[0]
            elif '```' in cleaned:
                parts = cleaned.split('```')
                for part in parts:
                    if '{' in part and '}' in part:
                        cleaned = part
                        break
            
            # Find JSON object boundaries
            start = cleaned.find('{')
            end = cleaned.rfind('}') + 1
            if start != -1 and end > start:
                cleaned = cleaned[start:end]
            
            # Clean the JSON string
            cleaned = cleaned.strip()
            print(f"Cleaned JSON preview: {cleaned[:200]}...")
            
            content = json.loads(cleaned)
            
            required_keys = ['video_summary', 'detailed_explanation', 'key_points', 'flashcards', 'quiz_questions']
            if not all(key in content for key in required_keys):
                print(f"✗ Missing keys: {list(content.keys())}")
                return None
            
            summary_len = len(content.get('video_summary', ''))
            explanation_len = len(content.get('detailed_explanation', ''))
            flashcards_count = len(content.get('flashcards', []))
            quiz_count = len(content.get('quiz_questions', []))
            key_points_count = len(content.get('key_points', []))
            
            print(f"Validation: summary={summary_len}, explanation={explanation_len}, flashcards={flashcards_count}, quiz={quiz_count}, points={key_points_count}")
            
            if (flashcards_count >= 10 and quiz_count >= 8 and key_points_count >= 5 and summary_len > 200 and explanation_len > 1500):
                print("✓ Content validated")
                return content
            else:
                print(f"✗ Content too short: flashcards={flashcards_count}/10, quiz={quiz_count}/8, points={key_points_count}/5")
        except Exception as e:
            print(f"✗ Parse error: {str(e)[:100]}")
    
    return None

@app.post("/api/process-video")
async def process_video(request: VideoRequest):
    try:
        video_id = extract_video_id(request.url)
        metadata = get_video_metadata(video_id)
        title = metadata["title"]
        
        print(f"\n{'='*60}\nProcessing: {title}\n{'='*60}")
        
        transcript = get_transcript(video_id)
        print(f"Transcript: {len(transcript)} chars")
        
        topic = extract_topic(title, transcript)
        print(f"Topic: {topic}")
        
        content = generate_content_with_ai(topic, title, transcript)
        
        if not content:
            print("✗ AI failed - trying one more time with OpenAI...")
            # Force OpenAI for retry
            if OPENAI_API_KEY:
                simple_prompt = f"""Create comprehensive JSON about {topic}:
{{
  "video_summary": "200 words detailed summary",
  "detailed_explanation": "1500+ words with 6-8 paragraphs covering: intro, core concepts, mechanism, examples, applications, misconceptions, insights, conclusion",
  "key_points": ["🎯 Core: 80 words", "⚙️ How: 80 words", "🌍 Example 1: 80 words", "🌍 Example 2: 80 words", "💡 Application: 80 words", "⚠️ Misconception: 80 words", "🔬 Insight: 80 words", "🔑 Takeaway: 80 words"],
  "flashcards": [{{"term": "x", "definition": "40-50 words"}}],
  "quiz_questions": [{{"id": 1, "question": "x", "type": "multiple_choice", "options": ["A","B","C","D"], "correct": 0, "explanation": "y"}}]
}}
key_points must be array of 8 strings. Make content DETAILED. Return JSON only."""
                retry_response = call_ai_with_fallback(simple_prompt)
                if retry_response:
                    try:
                        print(f"Retry response preview: {retry_response[:200]}...")
                        retry_cleaned = retry_response.strip()
                        
                        if '```json' in retry_cleaned:
                            retry_cleaned = retry_cleaned.split('```json')[1].split('```')[0]
                        elif '```' in retry_cleaned:
                            parts = retry_cleaned.split('```')
                            for part in parts:
                                if '{' in part and '}' in part:
                                    retry_cleaned = part
                                    break
                        
                        start = retry_cleaned.find('{')
                        end = retry_cleaned.rfind('}') + 1
                        if start != -1 and end > start:
                            retry_cleaned = retry_cleaned[start:end]
                        
                        content = json.loads(retry_cleaned.strip())
                        print("✓ Retry successful!")
                    except Exception as e:
                        print(f"✗ Retry failed: {str(e)[:100]}")
        
        if not content:
            print("✗ Generating fallback educational content")
            # Generate actual educational content about the topic
            fallback_prompt = f"""Create comprehensive educational content about {topic} in JSON format:

{{
  "video_summary": "Write 250-300 words explaining what {topic} is, why it's important, how it works, and where it's used. Make it educational and informative.",
  "detailed_explanation": "Write 2000+ words covering: Introduction to {topic}, Core Concepts, How It Works, Mathematical Framework (if applicable), Real-World Applications, Examples, Common Misconceptions, Advanced Insights, Problem-Solving Approaches, and Key Takeaways. Use plain text without markdown symbols.",
  "key_points": ["8 detailed points about {topic}, each 80-100 words covering different aspects"],
  "flashcards": [{{"term": "concept", "definition": "40-50 words", "difficulty": "beginner/intermediate/advanced"}}],
  "quiz_questions": [{{"id": 1, "question": "text", "type": "multiple_choice", "options": ["A","B","C","D"], "correct": 0, "explanation": "text", "difficulty": "easy/medium/hard"}}]
}}

Generate 12 flashcards and 10 quiz questions. Make all content educational and comprehensive. Return only JSON."""
            
            fallback_response = call_ai_with_fallback(fallback_prompt)
            if fallback_response:
                try:
                    cleaned = fallback_response.strip()
                    if '```json' in cleaned:
                        cleaned = cleaned.split('```json')[1].split('```')[0]
                    elif '```' in cleaned:
                        parts = cleaned.split('```')
                        for part in parts:
                            if '{' in part:
                                cleaned = part
                                break
                    start = cleaned.find('{')
                    end = cleaned.rfind('}') + 1
                    if start != -1 and end > start:
                        cleaned = cleaned[start:end]
                    content = json.loads(cleaned.strip())
                    print("✓ Fallback content generated successfully")
                except Exception as e:
                    print(f"✗ Fallback parse error: {str(e)[:100]}")
                    content = None
        
        if not content:
            print("✗ Using basic fallback content")
            content = {
                "video_summary": f"""{topic} is a fundamental concept in its field of study. Understanding {topic} is essential for grasping more advanced concepts and applications. This topic covers the basic principles, mechanisms, and practical applications that make it relevant in both theoretical and real-world contexts. Students studying {topic} will learn how it works, why it matters, and where it is applied in various domains. The concept has significant implications for problem-solving and critical thinking in related areas.""",
                
                "detailed_explanation": f"""Introduction to {topic}

{topic} is an important concept that plays a significant role in its field. Understanding this topic requires grasping both the theoretical foundations and practical applications. This comprehensive guide will explore the key aspects of {topic}, including its fundamental principles, mechanisms, applications, and significance.

Core Concepts

The fundamental principles underlying {topic} are essential for building a strong foundation. These concepts form the basis for more advanced understanding and practical application. Students should focus on understanding the basic definitions, key terminologies, and foundational theories that make up {topic}.

How It Works

The mechanism behind {topic} involves several interconnected processes and principles. Understanding how these elements work together provides insight into both the theoretical and practical aspects of the concept. The step-by-step process demonstrates the cause-and-effect relationships that are central to {topic}.

Real-World Applications

{topic} has numerous practical applications across various domains. From technology and industry to everyday life, this concept plays a crucial role in solving real-world problems. Understanding these applications helps students see the relevance and importance of mastering {topic}.

Mathematical Framework

Where applicable, {topic} involves mathematical relationships and equations that describe its behavior and properties. These mathematical tools allow for precise analysis and prediction, making them essential for advanced study and practical problem-solving.

Examples and Case Studies

Concrete examples help illustrate how {topic} works in practice. By examining specific scenarios and case studies, students can better understand the application of theoretical concepts to real situations. These examples bridge the gap between abstract theory and practical implementation.

Common Misconceptions

Many students encounter common misunderstandings when learning about {topic}. Identifying and addressing these misconceptions is crucial for developing accurate understanding. Recognizing what is often misunderstood helps students avoid common pitfalls in their learning journey.

Advanced Insights

Beyond the basics, {topic} offers deeper insights and connections to other concepts. Advanced understanding involves recognizing subtle relationships, exceptions, and applications that go beyond introductory material. This level of knowledge is essential for expertise in the field.

Problem-Solving Approaches

Applying {topic} to solve problems requires systematic approaches and strategies. Understanding effective problem-solving methodologies helps students tackle challenges confidently. These approaches combine theoretical knowledge with practical skills.

Key Takeaways

Mastering {topic} requires understanding its fundamental principles, mechanisms, applications, and problem-solving approaches. Students should focus on building strong foundations while also exploring advanced concepts and real-world applications. Continued practice and exploration will deepen understanding and expertise.""",
                
                "key_points": [
                    f"Core Definition: {topic} represents a fundamental concept in its field. Understanding the basic definition and core principles is essential for building knowledge. This concept forms the foundation for more advanced topics and applications in related areas.",
                    
                    f"Key Principles: The main principles governing {topic} explain how and why it works. These principles are based on established theories and have been validated through research and practical application. Mastering these principles is crucial for deep understanding.",
                    
                    f"Mechanism: {topic} operates through specific processes and mechanisms. Understanding the step-by-step workings helps clarify how inputs are transformed into outputs. This knowledge is essential for both theoretical understanding and practical application.",
                    
                    f"Real-World Example: {topic} can be observed in everyday situations and practical contexts. Recognizing these real-world manifestations helps connect abstract concepts to tangible experiences. This connection enhances understanding and retention.",
                    
                    f"Practical Applications: {topic} has numerous applications across various fields including technology, industry, and research. These applications demonstrate the practical value and relevance of understanding this concept. Knowledge of applications motivates deeper study.",
                    
                    f"Mathematical Framework: Where applicable, {topic} involves mathematical relationships and equations. These mathematical tools provide precise ways to analyze and predict behavior. Understanding the math deepens comprehension of underlying principles.",
                    
                    f"Common Misconceptions: Students often misunderstand certain aspects of {topic}. Recognizing these common errors helps avoid pitfalls in learning. Correct understanding requires addressing and correcting these misconceptions early.",
                    
                    f"Advanced Insights: Beyond basics, {topic} connects to other concepts and has deeper implications. Advanced understanding involves recognizing subtle relationships and applications. This expert-level knowledge distinguishes mastery from basic familiarity."
                ],
                
                "flashcards": [
                    {"term": f"What is {topic}?", "definition": f"{topic} is a fundamental concept that involves specific principles and mechanisms. It plays an important role in its field and has practical applications. Understanding this concept requires grasping both theoretical foundations and real-world implementations.", "difficulty": "beginner"},
                    {"term": f"Core Principles of {topic}", "definition": f"The main principles governing {topic} explain its behavior and characteristics. These principles are based on established theories and have been validated through research. They form the foundation for understanding more complex aspects.", "difficulty": "beginner"},
                    {"term": f"How {topic} Works", "definition": f"{topic} operates through specific mechanisms and processes. Understanding the step-by-step workings clarifies how different components interact. This knowledge is essential for both theoretical comprehension and practical application.", "difficulty": "intermediate"},
                    {"term": f"Applications of {topic}", "definition": f"{topic} has numerous practical applications in technology, industry, and research. These applications demonstrate its real-world value and relevance. Understanding applications helps connect theory to practice.", "difficulty": "intermediate"},
                    {"term": f"Mathematical Framework of {topic}", "definition": f"Where applicable, {topic} involves mathematical relationships and equations that describe its behavior. These mathematical tools allow for precise analysis and prediction. Understanding the math deepens comprehension.", "difficulty": "intermediate"},
                    {"term": f"Real-World Examples of {topic}", "definition": f"{topic} can be observed in everyday situations and practical contexts. Recognizing these manifestations helps connect abstract concepts to tangible experiences. Examples enhance understanding and retention.", "difficulty": "intermediate"},
                    {"term": f"Common Misconceptions about {topic}", "definition": f"Students often misunderstand certain aspects of {topic}. Recognizing these common errors helps avoid learning pitfalls. Correct understanding requires addressing and correcting misconceptions early in the learning process.", "difficulty": "intermediate"},
                    {"term": f"Advanced Concepts in {topic}", "definition": f"Beyond basics, {topic} involves deeper insights and connections to other concepts. Advanced understanding requires recognizing subtle relationships and applications. This expert-level knowledge distinguishes mastery from basic familiarity.", "difficulty": "advanced"},
                    {"term": f"Problem-Solving with {topic}", "definition": f"Applying {topic} to solve problems requires systematic approaches and strategies. Understanding effective methodologies helps tackle challenges confidently. These approaches combine theoretical knowledge with practical skills.", "difficulty": "advanced"},
                    {"term": f"Historical Context of {topic}", "definition": f"The development and evolution of {topic} provides important context for current understanding. Key discoveries and breakthroughs shaped how we understand this concept today. Historical perspective enriches comprehension.", "difficulty": "beginner"},
                    {"term": f"Related Concepts to {topic}", "definition": f"{topic} connects to other important concepts in its field. Understanding these relationships provides broader context and deeper insight. Recognizing connections helps build comprehensive knowledge networks.", "difficulty": "advanced"},
                    {"term": f"Future Developments in {topic}", "definition": f"Recent research and emerging developments continue to advance understanding of {topic}. New applications and technologies build on foundational principles. Staying current with developments is important for expertise.", "difficulty": "advanced"}
                ],
                
                "quiz_questions": [
                    {"id": 1, "question": f"What is the primary focus of {topic}?", "type": "multiple_choice", "options": ["Understanding fundamental principles and applications", "Memorizing random facts", "Avoiding practical use", "Ignoring theoretical foundations"], "correct": 0, "explanation": f"The primary focus of {topic} is understanding its fundamental principles and how they apply in practice. This combination of theory and application is essential for mastery.", "difficulty": "easy"},
                    
                    {"id": 2, "question": f"{topic} has practical real-world applications.", "type": "true_false", "correct": True, "explanation": f"True. {topic} has numerous practical applications across various fields including technology, industry, and research. Understanding these applications is key to seeing its relevance.", "difficulty": "easy"},
                    
                    {"id": 3, "question": f"Which aspect is most important for understanding {topic}?", "type": "multiple_choice", "options": ["Grasping core principles and mechanisms", "Memorizing definitions only", "Skipping examples", "Avoiding practice"], "correct": 0, "explanation": f"Understanding the core principles and mechanisms of {topic} is most important. This foundational knowledge enables deeper learning and practical application.", "difficulty": "medium"},
                    
                    {"id": 4, "question": f"How does understanding {topic} benefit students?", "type": "multiple_choice", "options": ["Enables problem-solving and connects theory to practice", "Has no practical value", "Only useful for tests", "Irrelevant to real world"], "correct": 0, "explanation": f"Understanding {topic} enables effective problem-solving and helps connect theoretical knowledge to practical applications. This makes learning both meaningful and useful.", "difficulty": "medium"},
                    
                    {"id": 5, "question": f"Learning {topic} requires understanding both theory and practice.", "type": "true_false", "correct": True, "explanation": f"True. Mastering {topic} requires understanding theoretical foundations as well as practical applications. Both aspects are essential for comprehensive knowledge.", "difficulty": "medium"},
                    
                    {"id": 6, "question": f"What is a common misconception about {topic}?", "type": "multiple_choice", "options": ["That it has no practical applications", "That it is well-understood", "That it is important", "That it requires study"], "correct": 0, "explanation": f"A common misconception is that {topic} has no practical applications. In reality, it has numerous real-world uses across various fields and industries.", "difficulty": "hard"},
                    
                    {"id": 7, "question": f"Advanced understanding of {topic} involves recognizing connections to other concepts.", "type": "true_false", "correct": True, "explanation": f"True. Advanced mastery of {topic} requires recognizing how it connects to related concepts and broader principles. These connections deepen understanding and enable expert-level knowledge.", "difficulty": "hard"},
                    
                    {"id": 8, "question": f"Which approach best supports learning {topic}?", "type": "multiple_choice", "options": ["Combining theory, examples, and practice problems", "Only reading definitions", "Avoiding difficult concepts", "Skipping fundamentals"], "correct": 0, "explanation": f"The best approach combines theoretical understanding with concrete examples and practice problems. This multi-faceted method builds comprehensive knowledge of {topic}.", "difficulty": "hard"},
                    
                    {"id": 9, "question": f"What makes {topic} relevant to modern applications?", "type": "multiple_choice", "options": ["Its principles apply to current technology and industry", "It is outdated", "It has no modern use", "It is purely theoretical"], "correct": 0, "explanation": f"{topic} remains relevant because its principles apply to modern technology and industry. Understanding it is essential for working with current applications and innovations.", "difficulty": "hard"},
                    
                    {"id": 10, "question": f"Mastering {topic} requires both foundational knowledge and advanced insights.", "type": "true_false", "correct": True, "explanation": f"True. Complete mastery of {topic} requires building strong foundations while also exploring advanced concepts and applications. Both levels of understanding are necessary for expertise.", "difficulty": "medium"}
                ]
            }
        
        video_contexts[video_id] = {
            "title": title,
            "topic": topic,
            "transcript": transcript,
            "content": content["detailed_explanation"]
        }
        
        return StudyMaterial(
            video_id=video_id,
            title=title,
            topic=topic,
            transcript=transcript,
            video_summary=content["video_summary"],
            detailed_explanation=content["detailed_explanation"],
            key_points=content["key_points"],
            flashcards=content["flashcards"],
            quiz_questions=content["quiz_questions"]
        )
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/chat")
async def chat_tutor(request: ChatRequest):
    context = video_contexts.get(request.video_id, {})
    topic = context.get('topic', 'this topic')
    transcript = context.get('transcript', '')
    content = context.get('content', '')
    
    # Use transcript or content for context
    context_text = transcript[:2000] if transcript else content[:2000] if content else f"Teaching {topic}"
    
    prompt = f"""You are a helpful tutor explaining "{topic}" to a student.

Context about {topic}:
{context_text}

Student's question: {request.message}

Provide a helpful answer following these rules:
- Keep it SHORT: 2-3 sentences (40-60 words maximum)
- Use SIMPLE language (explain like to a 10-year-old)
- Give ONE clear, relatable example
- Be encouraging and friendly
- Focus on the specific question asked
- Use information from the context above

Your answer:"""
    
    response = call_ai_with_fallback(prompt)
    if not response:
        response = f"Great question about {topic}! Let me explain: {topic} is an important concept. Think of it like [simple example]. The key is understanding the basics first. Would you like me to explain a specific part?"
    
    return {"response": response}

@app.post("/api/generate-flashcards")
async def generate_more_flashcards(request: GenerateFlashcardsRequest):
    current_time = time.time()
    last_request = rate_limit_tracker.get(request.video_id, 0)
    
    if current_time - last_request < 10:
        wait_time = int(10 - (current_time - last_request))
        raise HTTPException(status_code=429, detail=f"Wait {wait_time}s")
    
    rate_limit_tracker[request.video_id] = current_time
    
    context = video_contexts.get(request.video_id, {})
    if not context:
        raise HTTPException(status_code=404, detail="Video not found")
    
    topic = context.get('topic', 'this topic')
    transcript = context.get('transcript', '')
    
    prompt = f"""Generate EXACTLY {request.count} NEW and UNIQUE flashcards about {topic}.

Context: {transcript[:3000] if transcript else f"Topic: {topic}"}

JSON format:
{{"flashcards": [{{"term": "specific term", "definition": "clear 25-word explanation"}}]}}

IMPORTANT RULES:
1. Generate EXACTLY {request.count} flashcards
2. Each term must be DIFFERENT and UNIQUE (no duplicates)
3. Each term must be specific to {topic}
4. Each definition must be 20-30 words
5. Cover DIFFERENT aspects of {topic} (don't repeat concepts)
6. Make them educational and useful
7. Use advanced/detailed concepts (not basic ones)

Return ONLY valid JSON."""
    
    response = call_ai_with_fallback(prompt)
    
    if response:
        try:
            cleaned = response.strip()
            if '```json' in cleaned:
                cleaned = cleaned.split('```json')[1].split('```')[0]
            elif '```' in cleaned:
                parts = cleaned.split('```')
                for part in parts:
                    if '{' in part:
                        cleaned = part
                        break
            
            start = cleaned.find('{')
            end = cleaned.rfind('}') + 1
            if start != -1 and end > start:
                cleaned = cleaned[start:end]
            
            data = json.loads(cleaned.strip())
            if data.get('flashcards') and len(data['flashcards']) > 0:
                flashcards = data['flashcards']
                
                # Remove duplicates based on term (case-insensitive)
                seen_terms = set()
                unique_flashcards = []
                for card in flashcards:
                    term_lower = card.get('term', '').lower().strip()
                    if term_lower and term_lower not in seen_terms:
                        seen_terms.add(term_lower)
                        unique_flashcards.append(card)
                
                # Return up to requested count
                result = unique_flashcards[:request.count]
                print(f"Flashcards: generated {len(flashcards)}, unique {len(unique_flashcards)}, returning {len(result)}")
                return {"flashcards": result, "success": True}
        except Exception as e:
            print(f"Flashcard parse error: {str(e)[:100]}")
    
    # Fallback: generate unique flashcards
    import random
    aspects = ["Definition", "Application", "Example", "Principle", "Theory", "Practice", "Concept", "Method", "Process", "Technique"]
    return {
        "flashcards": [{"term": f"{topic} - {aspects[i % len(aspects)]} {i+1}", "definition": f"Important {aspects[i % len(aspects)].lower()} related to {topic} that helps understand the topic better from a different perspective."} for i in range(request.count)],
        "success": False
    }

@app.post("/api/generate-quiz")
async def generate_more_quiz(request: GenerateQuizRequest):
    current_time = time.time()
    last_request = rate_limit_tracker.get(f"{request.video_id}_quiz", 0)
    
    if current_time - last_request < 10:
        raise HTTPException(status_code=429, detail=f"Wait {int(10 - (current_time - last_request))}s")
    
    rate_limit_tracker[f"{request.video_id}_quiz"] = current_time
    
    context = video_contexts.get(request.video_id, {})
    if not context:
        raise HTTPException(status_code=404, detail="Video not found")
    
    topic = context.get('topic', 'this topic')
    transcript = context.get('transcript', '')
    
    prompt = f"""Generate EXACTLY {request.count} NEW and UNIQUE quiz questions about {topic}.

Context: {transcript[:4000] if transcript else f"Topic: {topic}"}

Create {request.count} questions in this EXACT JSON format:
{{
  "quiz_questions": [
    {{"id": 1, "question": "What is the main concept of {topic}?", "type": "multiple_choice", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0, "explanation": "Explanation here", "difficulty": "{request.difficulty}"}},
    {{"id": 2, "question": "True or false about {topic}?", "type": "true_false", "correct": true, "explanation": "Explanation here", "difficulty": "{request.difficulty}"}}
  ]
}}

IMPORTANT RULES:
1. Generate EXACTLY {request.count} questions - count them: 1, 2, 3, 4, 5...
2. Each question must be DIFFERENT and UNIQUE (no duplicates or similar questions)
3. Use real content from the context about {topic}
4. Mix types: multiple_choice (4 options) and true_false
5. Cover DIFFERENT aspects of {topic} (don't repeat concepts)
6. Make questions educational and specific
7. Each explanation: 20-30 words
8. Difficulty level: {request.difficulty}
9. Return ONLY the JSON object, nothing else

Generate all {request.count} UNIQUE questions now:"""
    
    response = call_ai_with_fallback(prompt)
    
    if response:
        try:
            cleaned = response.strip()
            if '```json' in cleaned:
                cleaned = cleaned.split('```json')[1].split('```')[0]
            elif '```' in cleaned:
                parts = cleaned.split('```')
                for part in parts:
                    if '{' in part:
                        cleaned = part
                        break
            
            start = cleaned.find('{')
            end = cleaned.rfind('}') + 1
            if start != -1 and end > start:
                cleaned = cleaned[start:end]
            
            data = json.loads(cleaned.strip())
            if data.get('quiz_questions'):
                questions = data['quiz_questions']
                print(f"Generated {len(questions)} questions, requested {request.count}")
                
                # Remove duplicate questions (case-insensitive comparison)
                if len(questions) > 0:
                    seen_questions = set()
                    unique_questions = []
                    for q in questions:
                        question_text = q.get('question', '').lower().strip()
                        if question_text and question_text not in seen_questions:
                            seen_questions.add(question_text)
                            unique_questions.append(q)
                    
                    # Take up to requested count
                    questions = unique_questions[:request.count] if len(unique_questions) >= request.count else unique_questions
                    
                    # Fix IDs to be sequential
                    for i, q in enumerate(questions):
                        q['id'] = i + 1
                        # Ensure all required fields exist
                        if 'difficulty' not in q:
                            q['difficulty'] = request.difficulty
                    
                    print(f"Quiz: generated {len(data['quiz_questions'])}, unique {len(unique_questions)}, returning {len(questions)}")
                    return {"quiz_questions": questions, "success": True}
        except Exception as e:
            print(f"Quiz parse error: {str(e)[:100]}")
            print(f"Raw response: {response[:500]}")
    
    # Fallback: generate topic-specific quiz questions
    print(f"Using fallback for {request.count} questions")
    fallback_questions = []
    for i in range(request.count):
        if i % 2 == 0:
            fallback_questions.append({
                "id": i+1,
                "question": f"Which statement best describes {topic}?",
                "type": "multiple_choice",
                "options": [
                    f"It is a fundamental concept in the field",
                    f"It has no practical applications",
                    f"It contradicts established theories",
                    f"It is only theoretical"
                ],
                "correct": 0,
                "explanation": f"{topic} is an important concept with real-world applications and theoretical foundations.",
                "difficulty": request.difficulty
            })
        else:
            fallback_questions.append({
                "id": i+1,
                "question": f"{topic} has practical applications in real-world scenarios.",
                "type": "true_false",
                "correct": True,
                "explanation": f"True. {topic} is widely used and has many practical applications.",
                "difficulty": request.difficulty
            })
    
    return {
        "quiz_questions": fallback_questions,
        "success": False
    }

@app.post("/api/learn/generate-roadmap")
async def generate_learning_roadmap(request: LearnRequest):
    """Generate learning roadmap with topics and YouTube videos"""
    try:
        # Generate topics using Groq
        prompt = f"""Create a learning roadmap for: {request.topic}

Return ONLY a Python list of 8-12 topic strings in order from beginner to advanced.
Example: ['Introduction to {request.topic}', 'Basic Concepts', 'Intermediate Topics', 'Advanced Applications']

Return only the list, nothing else:"""
        
        response_text = call_ai_with_fallback(prompt)
        if not response_text:
            raise ValueError("AI generation failed")
        
        # Extract list from response
        start = response_text.find("[")
        end = response_text.rfind("]") + 1
        if start != -1 and end > start:
            text_content = response_text[start:end]
            topics_list = ast.literal_eval(text_content)
        else:
            raise ValueError("Could not extract topics list")
        
        # Get YouTube videos for each topic
        roadmap = []
        for idx, topic in enumerate(topics_list):
            try:
                videos_search = VideosSearch(topic, limit=4)
                results = videos_search.result()
                
                links = []
                for i in range(min(4, len(results['result']))):
                    links.append(results['result'][i]['link'])
                
                roadmap.append({
                    "index": idx,
                    "topic": topic,
                    "links": links
                })
            except Exception as e:
                print(f"Error fetching videos for {topic}: {e}")
                roadmap.append({
                    "index": idx,
                    "topic": topic,
                    "links": []
                })
        
        return roadmap
    
    except Exception as e:
        print(f"Learn roadmap error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/learn/chat")
async def learn_chat(request: ChatRequest):
    """Chat about learning topic"""
    prompt = f"""You are a helpful learning assistant.

Student's question: {request.message}

Provide a clear, concise answer (2-3 paragraphs). Use simple language and examples.

Your answer:"""
    
    response = call_ai_with_fallback(prompt)
    if not response:
        response = "I'm here to help you learn! Could you rephrase your question?"
    
    return {"response": response}

@app.get("/api/learn/summary")
async def get_video_summary(video_id: str):
    """Get summary of a YouTube video"""
    try:
        transcript = get_transcript(video_id)
        if not transcript:
            raise HTTPException(status_code=404, detail="No transcript available")
        
        prompt = f"""Summarize this educational video transcript in 200-250 words. Make it clear and engaging.

Transcript:
{transcript[:5000]}

Summary:"""
        
        summary = call_ai_with_fallback(prompt)
        if not summary:
            summary = "Summary generation failed. Please try again."
        
        return {"summary": summary}
    
    except Exception as e:
        print(f"Summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/code/generate-tree")
async def generate_code_tree(request: CodeTreeRequest):
    """Generate learning tree for a programming language"""
    try:
        prompt = f"""Create a comprehensive learning tree for {request.language} programming.

Generate 15-20 topics organized in a tree structure from Beginner to Advanced level.
For each topic, provide: id, title, level (beginner/intermediate/advanced), row, col (for positioning).

Return ONLY valid JSON in this format:
{{
  "topics": [
    {{"id": "1", "title": "Introduction to {request.language}", "level": "beginner", "row": 0, "col": 0}},
    {{"id": "2", "title": "Variables and Data Types", "level": "beginner", "row": 1, "col": 0}}
  ],
  "connections": [
    {{"from": "1", "to": "2"}}
  ]
}}

Make it a proper learning path where topics build on each other."""
        
        text_content = call_ai_with_fallback(prompt)
        if not text_content:
            raise ValueError("AI generation failed")
        
        # Extract JSON
        start = text_content.find('{')
        end = text_content.rfind('}') + 1
        if start != -1 and end > start:
            text_content = text_content[start:end]
        
        data = json.loads(text_content)
        return data
    
    except Exception as e:
        print(f"Tree generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/code/get-resources")
async def get_code_resources(request: CodeResourcesRequest):
    """Get YouTube videos and practice websites for a topic"""
    try:
        # Search YouTube videos
        from youtubesearchpython import VideosSearch
        search_query = f"{request.language} {request.topic} tutorial"
        videos_search = VideosSearch(search_query, limit=4)
        results = videos_search.result()
        
        videos = []
        for video in results['result']:
            videos.append({
                "title": video['title'],
                "url": video['link'],
                "thumbnail": video['thumbnails'][0]['url'] if video.get('thumbnails') else '',
                "channel": video.get('channel', {}).get('name', 'Unknown')
            })
        
        # Generate practice websites using AI
        prompt = f"""List 3-4 best practice websites for learning {request.language} - {request.topic}.

Return ONLY valid JSON:
{{
  "practice": [
    {{"name": "Website Name", "url": "https://...", "type": "Interactive Coding", "description": "Brief description"}}
  ],
  "description": "Brief overview of the topic"
}}"""
        
        ai_response = call_ai_with_fallback(prompt)
        
        # Extract JSON
        start = ai_response.find('{')
        end = ai_response.rfind('}') + 1
        if start != -1 and end > start:
            ai_response = ai_response[start:end]
        
        practice_data = json.loads(ai_response)
        
        return {
            "videos": videos,
            "practice": practice_data.get('practice', []),
            "description": practice_data.get('description', '')
        }
    
    except Exception as e:
        print(f"Resources error: {e}")
        return {
            "videos": [],
            "practice": [],
            "description": "Failed to load resources. Please try again."
        }

@app.post("/api/code/chat")
async def code_chat(request: CodeChatRequest):
    """AI chat for coding doubts"""
    prompt = f"""You are a helpful coding tutor for {request.language}.

Topic: {request.topic}
Student's question: {request.message}

Provide a clear, concise answer (2-3 paragraphs). Use simple language and examples.

Your answer:"""
    
    response = call_ai_with_fallback(prompt)
    if not response:
        response = f"I'm here to help with {request.language}! Could you rephrase your question?"
    
    return {"response": response}

@app.post("/api/explain-flashcard")
async def explain_flashcard(request: ExplainFlashcardRequest):
    """Provide detailed AI explanation for a flashcard concept"""
    try:
        context = video_contexts.get(request.video_id, {})
        topic = context.get('topic', 'this topic')
        transcript = context.get('transcript', '')
        
        context_text = transcript[:3000] if transcript else f"Topic: {topic}"
        
        prompt = f"""You are an expert tutor explaining the concept "{request.term}" to a student learning about {topic}.

Context from video:
{context_text}

Flashcard Definition: {request.definition}

Provide a comprehensive, engaging explanation following this structure:

## 🎯 Detailed Explanation
Expand on the definition with more details, context, and clarity. (100-150 words)

## 📚 Real-World Examples
Provide 2-3 specific, relatable examples showing this concept in action. Include concrete details, numbers, or scenarios. (100-150 words)

## 🔗 Connections
How does this concept relate to other concepts in {topic}? What are the dependencies or relationships? (80-100 words)

## 💡 Key Insights
What's important to remember? Any tricks for understanding or remembering this concept? (60-80 words)

## 🎓 Further Learning
What should a student explore next to deepen their understanding? Related concepts or applications. (60-80 words)

Make it clear, engaging, and educational. Use markdown formatting with **bold** for emphasis.

Your explanation:"""
        
        response = call_ai_with_fallback(prompt)
        if not response:
            response = f"**{request.term}**: {request.definition}\n\nThis concept is fundamental to understanding {topic}. Let me know if you'd like more specific details!"
        
        return {"explanation": response}
    
    except Exception as e:
        print(f"Explain flashcard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-mindmap")
async def generate_mindmap(request: MindMapRequest):
    """Generate mind map data for visual concept hierarchy"""
    try:
        context = video_contexts.get(request.video_id, {})
        if not context:
            raise HTTPException(status_code=404, detail="Video not found")
        
        topic = context.get('topic', 'this topic')
        transcript = context.get('transcript', '')
        
        prompt = f"""Create a comprehensive mind map structure for {topic}.

Context: {transcript[:4000] if transcript else f"Topic: {topic}"}

Generate a hierarchical mind map with the following structure:

{{
  "central_topic": "{topic}",
  "main_branches": [
    {{
      "id": "1",
      "label": "Main Category 1",
      "color": "#FF6B6B",
      "sub_nodes": [
        {{"id": "1.1", "label": "Sub-concept 1", "description": "Brief description (20-30 words)"}},
        {{"id": "1.2", "label": "Sub-concept 2", "description": "Brief description (20-30 words)"}}
      ]
    }},
    {{
      "id": "2",
      "label": "Main Category 2",  
      "color": "#4ECDC4",
      "sub_nodes": [...]
    }}
  ]
}}

Create 5-7 main branches, each with 3-5 sub-nodes.
Main categories should cover: Fundamentals, Mechanisms/Processes, Applications, Mathematical Framework (if applicable), Real-World Examples, Advanced Concepts.
Use diverse colors: #FF6B6B, #4ECDC4, #45B7D1, #FFA07A, #98D8C8, #F7DC6F, #BB8FCE

Return ONLY valid JSON."""

        response = call_ai_with_fallback(prompt)
        
        if response:
            try:
                cleaned = response.strip()
                if '```json' in cleaned:
                    cleaned = cleaned.split('```json')[1].split('```')[0]
                elif '```' in cleaned:
                    parts = cleaned.split('```')
                    for part in parts:
                        if '{' in part:
                            cleaned = part
                            break
                
                start = cleaned.find('{')
                end = cleaned.rfind('}') + 1
                if start != -1 and end > start:
                    cleaned = cleaned[start:end]
                
                mindmap_data = json.loads(cleaned.strip())
                return mindmap_data
            except Exception as e:
                print(f"Mindmap parse error: {e}")
        
        # Fallback mindmap
        return {
            "central_topic": topic,
            "main_branches": [
                {
                    "id": "1",
                    "label": "Fundamentals",
                    "color": "#FF6B6B",
                    "sub_nodes": [
                        {"id": "1.1", "label": "Core Definition", "description": f"Basic understanding of {topic}"},
                        {"id": "1.2", "label": "Key Principles", "description": f"Fundamental principles governing {topic}"}
                    ]
                },
                {
                    "id": "2",
                    "label": "Applications",
                    "color": "#4ECDC4",
                    "sub_nodes": [
                        {"id": "2.1", "label": "Real-World Uses", "description": f"Practical applications of {topic}"},
                        {"id": "2.2", "label": "Technology", "description": f"Modern technology using {topic}"}
                    ]
                }
            ]
        }
    
    except Exception as e:
        print(f"Mindmap generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-infographic")
async def generate_infographic(request: InfographicRequest):
    """Generate infographic data for visual summary"""
    try:
        context = video_contexts.get(request.video_id, {})
        if not context:
            raise HTTPException(status_code=404, detail="Video not found")
        
        topic = context.get('topic', 'this topic')
        transcript = context.get('transcript', '')
        
        prompt = f"""Create infographic data for {topic}.

Context: {transcript[:4000] if transcript else f"Topic: {topic}"}

Generate structured data for a visual infographic:

{{
  "title": "{topic} - Visual Summary",
  "key_statistics": [
    {{"label": "Key Metric 1", "value": "X%", "description": "Brief context (15-20 words)", "icon": "📊"}},
    {{"label": "Key Metric 2", "value": "Y units", "description": "Brief context (15-20 words)", "icon": "⚡"}},
    {{"label": "Key Metric 3", "value": "Z cases", "description": "Brief context (15-20 words)", "icon": "🎯"}}
  ],
  "process_flow": [
    {{"step": 1, "title": "Step 1 Name", "description": "What happens (25-30 words)", "icon": "1️⃣"}},
    {{"step": 2, "title": "Step 2 Name", "description": "What happens (25-30 words)", "icon": "2️⃣"}},
    {{"step": 3, "title": "Step 3 Name", "description": "What happens (25-30 words)", "icon": "3️⃣"}},
    {{"step": 4, "title": "Step 4 Name", "description": "What happens (25-30 words)", "icon": "4️⃣"}}
  ],
  "key_facts": [
    "Interesting fact 1 about {topic} (20-25 words)",
    "Interesting fact 2 about {topic} (20-25 words)",
    "Interesting fact 3 about {topic} (20-25 words)",
    "Interesting fact 4 about {topic} (20-25 words)",
    "Interesting fact 5 about {topic} (20-25 words)"
  ],
  "timeline": [
    {{"year": "YYYY", "event": "Historical milestone (20-25 words)"}},
    {{"year": "YYYY", "event": "Important development (20-25 words)"}},
    {{"year": "YYYY", "event": "Modern breakthrough (20-25 words)"}}
  ],
  "applications": [
    {{"area": "Field 1", "usage": "How it's used (30-40 words)", "impact": "High/Medium", "icon": "🏭"}},
    {{"area": "Field 2", "usage": "How it's used (30-40 words)", "impact": "High/Medium", "icon": "🔬"}},
    {{"area": "Field 3", "usage": "How it's used (30-40 words)", "impact": "High/Medium", "icon": "💻"}}
  ]
}}

Use real numbers, dates, and facts where possible. Return ONLY valid JSON."""

        response = call_ai_with_fallback(prompt)
        
        if response:
            try:
                cleaned = response.strip()
                if '```json' in cleaned:
                    cleaned = cleaned.split('```json')[1].split('```')[0]
                elif '```' in cleaned:
                    parts = cleaned.split('```')
                    for part in parts:
                        if '{' in part:
                            cleaned = part
                            break
                
                start = cleaned.find('{')
                end = cleaned.rfind('}') + 1
                if start != -1 and end > start:
                    cleaned = cleaned[start:end]
                
                infographic_data = json.loads(cleaned.strip())
                return infographic_data
            except Exception as e:
                print(f"Infographic parse error: {e}")
        
        # Fallback infographic
        return {
            "title": f"{topic} - Visual Summary",
            "key_statistics": [
                {"label": "Core Concepts", "value": "5+", "description": f"Main ideas central to understanding {topic}", "icon": "📊"},
                {"label": "Applications", "value": "Many", "description": f"Practical uses of {topic} across industries", "icon": "⚡"},
                {"label": "Importance", "value": "High", "description": f"Impact and significance of {topic} in modern world", "icon": "🎯"}
            ],
            "process_flow": [
                {"step": 1, "title": "Foundation", "description": f"Understanding basic principles of {topic}", "icon": "1️⃣"},
                {"step": 2, "title": "Mechanism", "description": f"How {topic} works in detail", "icon": "2️⃣"},
                {"step": 3, "title": "Application", "description": f"Applying {topic} to solve problems", "icon": "3️⃣"},
                {"step": 4, "title": "Mastery", "description": f"Advanced understanding and expertise in {topic}", "icon": "4️⃣"}
            ],
            "key_facts": [
                f"{topic} is a fundamental concept in its field",
                f"Understanding {topic} enables solving complex problems",
                f"{topic} has numerous real-world applications",
                f"Modern technology heavily relies on {topic}",
                f"Mastering {topic} opens many opportunities"
            ],
            "timeline": [
                {"year": "Historical", "event": f"Early discoveries related to {topic}"},
                {"year": "Modern", "event": f"Contemporary understanding of {topic}"},
                {"year": "Future", "event": f"Emerging developments in {topic}"}
            ],
            "applications": [
                {"area": "Technology", "usage": f"How {topic} powers modern technology and innovations", "impact": "High", "icon": "💻"},
                {"area": "Industry", "usage": f"Industrial applications and commercial use of {topic}", "impact": "High", "icon": "🏭"},
                {"area": "Research", "usage": f"Scientific research and academic study of {topic}", "impact": "Medium", "icon": "🔬"}
            ]
        }
    
    except Exception as e:
        print(f"Infographic generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class CustomRoadmapRequest(BaseModel):
    language: str

@app.post("/api/code/generate-custom-roadmap")
async def generate_custom_roadmap(request: CustomRoadmapRequest):
    """Generate custom programming language roadmap with AI"""
    try:
        lang_name = request.language.strip()
        lang_lower = lang_name.lower()
        
        # Generate DevIcon URL
        icon_url = f"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{lang_lower}/{lang_lower}-original.svg"
        
        # Determine color based on language
        colors = [
            "from-purple-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-green-500 to-emerald-500",
            "from-red-500 to-orange-500",
            "from-indigo-500 to-purple-500"
        ]
        color = colors[hash(lang_name) % len(colors)]
        
        # Generate roadmap using AI
        prompt = f"""Create a comprehensive learning roadmap for {lang_name} programming.

Generate 3 main topics, each with 5-7 levels. Return ONLY valid JSON:

{{
  "topics": [
    {{
      "id": "topic-1",
      "name": "Topic Name",
      "levels": [
        {{
          "id": "level-1",
          "title": "Level Title",
          "videos": ["https://www.youtube.com/results?search_query={lang_name}+topic+tutorial"],
          "practice": ["https://www.hackerrank.com", "https://leetcode.com"],
          "learning": ["https://docs.example.com", "https://www.w3schools.com"]
        }}
      ]
    }}
  ]
}}

Make it comprehensive and educational. Return only JSON."""
        
        response = call_ai_with_fallback(prompt)
        if not response:
            raise ValueError("AI generation failed")
        
        # Extract JSON
        cleaned = response.strip()
        if '```json' in cleaned:
            cleaned = cleaned.split('```json')[1].split('```')[0]
        elif '```' in cleaned:
            parts = cleaned.split('```')
            for part in parts:
                if '{' in part:
                    cleaned = part
                    break
        
        start = cleaned.find('{')
        end = cleaned.rfind('}') + 1
        if start != -1 and end > start:
            cleaned = cleaned[start:end]
        
        data = json.loads(cleaned.strip())
        
        return {
            "iconUrl": icon_url,
            "color": color,
            "topics": data.get('topics', [])
        }
    
    except Exception as e:
        print(f"Custom roadmap error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "ai": "Multi-AI (Groq/OpenAI/Gemini)"}

@app.get("/")
async def root():
    return {"message": "SVL Backend Running"}

if __name__ == "__main__":
    import uvicorn
    print("="*60)
    print("SVL - Multi-AI Backend (Groq → OpenAI → Gemini)")
    print("="*60)
    print("http://localhost:8000")
    print("="*60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
