import { useState } from 'react';

interface FormProps {
    files: FileList | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    jobPost: string;
    onJobPostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerate: () => void;
    loading?: boolean;
}

function Form({ files, onFileChange, jobPost, onJobPostChange, onGenerate, loading }: FormProps) {
    return (
        <>
        <div className="mb-3">
            <label htmlFor="exampleFormControlInput1" className="form-label">Upload your resume(s)</label>
            {files && files.length > 0 && (
                <ul className="mt-0 mb-2">
                    {Array.from(files).map((file, idx) => (
                        <li key={idx} className="small text-secondary">{file.name}</li>
                    ))}
                </ul>
            )}
            <input type="file" className="form-control form-control-sm" id="exampleFormControlInput1" multiple onChange={onFileChange}/>
        </div>
        <div className="mb-3">
            <label htmlFor="exampleFormControlInput2" className="form-label">Job Post Link</label>
            <input type="url" className="form-control" id="exampleFormControlInput2" placeholder="Paste the link to your job post here" value={jobPost} onChange={onJobPostChange}/>
        </div>
        <div className="d-grid gap-2">
            <button className="btn btn-primary" type="button" onClick={onGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Cover Letter'}
            </button>
        </div>
        </>  
    );
}

export default Form;