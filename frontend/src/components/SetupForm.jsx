import { useState } from "react";

const SECTORS = [
  // Engineering
  "Software Engineering",
  "Computer Science / IT",
  "Mechanical Engineering",
  "Aerospace Engineering",
  "Civil Engineering",
  "Materials Science & Engineering",
  "CSE / AI & ML",
  "EEE",
  "Electrical Engineering",
  "Materials Science & Engineering",
  "Semiconductor Engineering",
  "Web Development",
  "Electronics & Communication Engineering",
  "Chemical Engineering",
  "Industrial & Production Engineering",
  "Textile Engineering",
  "Data Science / AI & ML",
  "Cybersecurity",

  // Medical & Health
  "Medicine (MBBS)",
  "Pharmacy",
  "Nursing",
  "Dentistry (BDS)",
  "Physiotherapy",
  "Public Health",
  "Medical Laboratory Technology",
  "Nutrition & Dietetics",

  // Business
  "Business Administration (BBA)",
  "Accounting & Finance",
  "Marketing",
  "Human Resources (HR)",
  "Supply Chain & Logistics",
  "Banking",
  "Entrepreneurship / Startups",
  "Economics",

  // Law & Social Sciences
  "Law",
  "Journalism & Media",
  "Public Administration",
  "International Relations",
  "Psychology",
  "Social Work",

  // Design & Arts
  "Architecture",
  "Graphic Design",
  "UI/UX Design",
  "Fine Arts",
  "Fashion Design",

  // Education & Others
  "Education / Teaching",
  "Agriculture",
  "Aviation",
  "Hospitality & Tourism",
  "Environmental Science",
  "Statistics",
];

function SetupForm({ onQuestionsReady }) {
  const [sector, setSector] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sector.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, jobRole }),
      });
      const data = await response.json();
      onQuestionsReady(data.questions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      alert("Something went wrong. Check if backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Start a Mock Interview</h2>

      <label>Your Sector / Field</label>
      <input
        list="sector-options"
        type="text"
        placeholder="Search or select a sector..."
        value={sector}
        onChange={(e) => setSector(e.target.value)}
      />
      <datalist id="sector-options">
        {SECTORS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <label>Specific Role (optional)</label>
      <input
        type="text"
        placeholder="e.g. Frontend Developer, Cardiology Resident"
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
      />

     <button type="submit" disabled={loading}>
      {loading ? (
       <span className="loading-text">
        <span className="spinner"></span>
         Generating questions...
      </span>
    ) : (
    "Start Interview"
     )}
   </button>
    </form>
  );
}

export default SetupForm;