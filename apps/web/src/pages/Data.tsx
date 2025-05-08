import axios from "axios";
import { useEffect, useState } from "react";

const Data = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const response = axios.get("http://localhost:3000/api/allfolders");

    response
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">Data</div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {data?.dir?.map((item: any) => (
              <button
                key={item.folderId}
                style={{
                  padding: "8px 12px",
                  margin: "8px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  window.location.href = `http://localhost:5173/data/${item.name}`;
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Data;
