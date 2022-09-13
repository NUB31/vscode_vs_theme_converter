import io, { Socket } from "socket.io-client";
import { useCallback, useEffect, useRef, useState } from "react";

import { DefaultEventsMap } from "socket.io/dist/typed-events";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useDropzone } from "react-dropzone";

export default function User() {
  const [socket, setSocket] =
    useState<Socket<DefaultEventsMap, DefaultEventsMap>>();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: any) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      setFile(file);

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const dwnBtnRef = useRef<HTMLAnchorElement>();
  const ulList = useRef<HTMLUListElement>();

  function increaseProgress(message: string) {
    if (!message.includes("Connection established to server")) {
      setProgress((v) => v + 101 / 14);
    }
  }

  function log(message: any, type: any) {
    console.log(message, type);
    let item = document.createElement("li");
    item.className = "list-group-item";
    item.innerHTML = message;
    item.style.color =
      type === "success"
        ? "green"
        : type === "error"
        ? "red"
        : type === "info"
        ? "blue"
        : "lightgray";
    if (ulList.current) {
      ulList.current.appendChild(item);
      ulList.current.scrollTop = ulList.current.scrollHeight;
    }
  }

  const sendFile = async (file: any) => {
    let fd = new FormData();

    setProgress(0);

    fd.append("file", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        fd,
        {
          headers: {
            Authorization: socket?.id ? socket?.id : "",
          },
        }
      );
      console.log(res);
      console.log(res.data.message);
      console.log(res.data.status);
      increaseProgress(res.data.message);
      if (dwnBtnRef.current && res.data.data.url) {
        dwnBtnRef.current.href = res.data.data.url;
        dwnBtnRef.current.click();
      }
    } catch (err) {
      console.error(err);
      log(err?.response?.data?.message, err?.response?.data?.status);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  useEffect(() => {
    if (!socket) return console.log("no socket");
    socket.on("statusUpdate", (data) => {
      console.log(data);
      increaseProgress(data.message);
      // log(data.message, data.status);
    });
  }, [socket]);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL);
    if (newSocket) {
      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);
  return (
    <div className="px-4 w- flex flex-col justify-center items-center h-100 w-full text-[#1F2743]">
      <div className="flex flex-col justify-center items-center w-full sm:w-8/12 lg:w-1/2 2xl:w-1/3">
        <img src="../src/img/logo.svg" alt="" className="w-full" />
      </div>
      <div className="text-center mt-4 text-sm sm:text-base sm:py-2">
        <p>
          This service let’s you transform your favorite VS code color theme to
          a Visual Studio theme. Full instructions can be found at our{" "}
          <i>
            <a
              href="https://github.com/NUB31/vscode_vs_theme_converter"
              className="text-[#3BA8F2] no-underline font-semibold"
            >
              github repo
            </a>
          </i>
          . There you can also find all the sources used for this project and
          all the contributors that have participated.
        </p>
      </div>
      <div className="flex justify-center items-center flex-col">
        <div
          {...getRootProps()}
          className="flex justify-center items-center flex-col"
        >
          <div
            className={`${
              isDragActive ? "shadow-inner" : ""
            } shadow-inner border-dashed border-2 py-8 px-16 border-[#1F2743] cursor-pointer rounded-md grow`}
          >
            <input {...getInputProps()} multiple={false} />
            <div className="flex justify-center items-center flex-col">
              <img src="../src/img/upl-icon.png" alt="" className="w-1/3" />
              <div>
                <p className="opacity-[.5] text-center 2xl:text-xl">
                  Click or drop your .JSON file dhg
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <LoadingBar
            color={progress >= 91 ? "#2ea043" : "#47ADF3"}
            progress={progress}
            waitingTime={3000}
            onLoaderFinished={() => {}}
            height={5}
          />
        </div>
        <div
          className="mt-12 lg:mt-24 bg-[#1F2743] text-[#FEFDFA] py-4 px-8 cursor-pointer flex justify-center items-center text-center w-[30%] rounded-md 2xl:text-2xl"
          onClick={() => sendFile(file)}
        >
          <div className="flex justify-center items-center">Convert</div>
        </div>
        <a ref={dwnBtnRef} id="downloadLink" href=""></a>
        <ul ref={ulList}></ul>
      </div>
    </div>
  );
}
