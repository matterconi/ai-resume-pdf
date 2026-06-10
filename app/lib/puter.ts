import { create } from "zustand";

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  fs: {
    write: (
      path: string,
      data: string | File | Blob
    ) => Promise<FSItem | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };

  init: () => void;
  clearError: () => void;
}

const setError = (set: any, msg: string) => {
  set({
    error: msg,
    isLoading: false,
  });
};

export const usePuterStore = create<PuterStore>((set, get) => {
  const init = (): void => {
    set({ isLoading: false });
  };

  const write = async (path: string, data: string | File | Blob) => {
    const file = data instanceof File ? data : new File([data], path);
    return upload([file]);
  };

  const readDir = async (path: string) => {
    try {
      const res = await fetch("/api/files", {
        credentials: "include",
      });
      if (!res.ok) {
        setError(set, "Failed to list files");
        return;
      }
      return (await res.json()) as FSItem[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to list files";
      setError(set, msg);
      return;
    }
  };

  const readFile = async (path: string) => {
    try {
      const res = await fetch(`/api/files/${path}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setError(set, "Failed to read file");
        return;
      }
      return await res.blob();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to read file";
      setError(set, msg);
      return;
    }
  };

  const upload = async (files: File[] | Blob[]) => {
    const file = files[0] as File;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        setError(set, "Failed to upload file");
        return;
      }
      return (await res.json()) as FSItem;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload file";
      setError(set, msg);
      return;
    }
  };

  const deleteFile = async (path: string) => {
    try {
      const res = await fetch(`/api/files/${path}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setError(set, "Failed to delete file");
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete file";
      setError(set, msg);
    }
  };

  return {
    isLoading: true,
    error: null,
    fs: {
      write: (path: string, data: string | File | Blob) => write(path, data),
      read: (path: string) => readFile(path),
      readDir: (path: string) => readDir(path),
      upload: (files: File[] | Blob[]) => upload(files),
      delete: (path: string) => deleteFile(path),
    },
    init,
    clearError: () => set({ error: null }),
  };
});
