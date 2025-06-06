import { useState } from 'react';
import NavBar from './NavBar';
import Form from './Form';
import OutputBox from './OutputBox';

function App() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [jobPost, setJobPost] = useState('');
  const [output, setOutput] = useState('This is where the server output will appear...');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleJobPostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobPost(e.target.value);
  };

  const handleGenerate = async () => {
    if (!files || files.length === 0 || !jobPost) {
      setOutput('Please upload at least one resume and provide a job post link.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', files[0]);
      formData.append('job_post', jobPost);
      const response = await fetch('http://127.0.0.1:5000/generate-cover-letter', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setOutput(data.cover_letter || 'No cover letter generated.');
      } else {
        setOutput(data.error || 'An error occurred.');
      }
    } catch (err) {
      setOutput('An error occurred while generating the cover letter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark min-vh-100" data-bs-theme="dark" style={{ color: '#f8f9fa', backgroundColor: '#212121' }}>
      {/* <NavBar /> */}
      <div className={"pt-5"} style={{width: '40vw', margin: '0 auto'}}>
        <Form
          files={files}
          onFileChange={handleFileChange}
          jobPost={jobPost}
          onJobPostChange={handleJobPostChange}
          onGenerate={handleGenerate}
          loading={loading}
        />
        <div style={{ marginTop: '20px' }}>
          <OutputBox content={output} />
        </div>
      </div>
    </div>
  )
}

export default App;