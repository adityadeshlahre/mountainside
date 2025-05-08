import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const DataFiles = () => {
  const [DataFiles, setDataFiles] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const { sessionId } = useParams();
  useEffect(() => {
    if (!sessionId) {
      console.error("Session ID is not defined");
      return;
    }
    axios
      .get(`http://localhost:3000/api/${sessionId}`)
      .then((res) => {
        setDataFiles(res.data.dirFiles);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [sessionId]);
  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">Video Files</div>
        {DataFiles?.map((file: any) => (
          <div
            key={file.fileId}
            style={{ marginBottom: "1rem" }}
            className="flex flex-col items-center"
          >
            <video
              width={300}
              height={200}
              controls
              poster={file.thumbnail}
              src={file.url}
            />
            <p className="border-2 p-2 m-2 ">{file.name}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default DataFiles;
