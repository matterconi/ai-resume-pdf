import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useAuth } from "~/lib/use-auth";

const WipeApp = () => {
    const { isLoading: puterLoading, error, clearError, fs } = usePuterStore();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const navigate = useNavigate();
    const [files, setFiles] = useState<FSItem[]>([]);

    const loadFiles = async () => {
        const files = (await fs.readDir("./")) as FSItem[];
        setFiles(files);
    };

    useEffect(() => {
        loadFiles();
    }, []);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleDelete = async () => {
        files.forEach(async (file) => {
            await fs.delete(file.path);
        });
        await fetch('/api/resumes', { method: 'DELETE', credentials: 'include' });
        loadFiles();
    };

    if (authLoading || puterLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error {error}</div>;
    }

    return (
        <div>
            Authenticated as: {user?.name || user?.email}
            <div>Existing files:</div>
            <div className="flex flex-col gap-4">
                {files.map((file) => (
                    <div key={file.id} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
            </div>
            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                >
                    Wipe App Data
                </button>
            </div>
        </div>
    );
};

export default WipeApp;
