import { useCallback, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

import axios from "axios";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import LoadingBar from "react-top-loading-bar";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import DrawerLogs from "../components/DrawerLogs";
import useWindowDimensions from "../hooks/useWindowDimensions";
import checkMarkIcon from "../img/akar-icons_check.svg";
import largeLogo from "../img/logo-horizontal.svg";
import smallLogo from "../img/logo-vertical.svg";
import uploadIcon from "../img/upl-icon.png";

export default function User() {
  const [socket, setSocket] =
    useState<Socket<DefaultEventsMap, DefaultEventsMap>>();
  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState(0);
  const [checkMark, setcheckMark] = useState<boolean>(false);
  const [logs, setLogs] = useState<{ message: string; status: string }[]>([]);

  const uploadImageRef = useRef<HTMLImageElement>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (uploadImageRef.current) {
      uploadImageRef.current.classList.remove("scale-100");
      uploadImageRef.current.classList.add("scale-0");
    }
    setTimeout(() => {
      if (!file) {
        setcheckMark(false);
      } else {
        setcheckMark(true);
      }
      if (uploadImageRef.current) {
        uploadImageRef.current.classList.remove("scale-0");
        uploadImageRef.current.classList.add("scale-100");
      }
    }, 300);
  }, [file]);

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

  const dwnBtnRef = useRef<HTMLAnchorElement>(null);

  function increaseProgress(message: string) {
    if (!message.includes("Connection established to server")) {
      setProgress((v) => v + 101 / 14);
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
      setLogs([
        ...logs,
        { message: res.data.message, status: res.data.status },
      ]);
      increaseProgress(res.data.message);
      if (dwnBtnRef.current && res.data.data.url) {
        dwnBtnRef.current.href = res.data.data.url;
        dwnBtnRef.current.click();
      }
    } catch (err: any) {
      setLogs([
        ...logs,
        {
          message: err.response?.data?.message,
          status: err.response?.data?.status,
        },
      ]);
      toast.error(err.response?.data?.message);
      console.error(err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  useEffect(() => {
    if (!socket) return console.log("no socket");
    socket.on(
      "statusUpdate",
      ({ message, status }: { message: string; status: string }) => {
        increaseProgress(message);
        setLogs([...logs, { message: message, status: status }]);
      }
    );
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
    <div className="flex flex-col items-center w-full text-[#1F2743] bg-[url('./img/Vector.svg')] bg-full h-screen bg-no-repeat bg-center ">
      <DrawerLogs logs={logs} />

      <header className="flex justify-center ">
        <img
          src={width < 640 ? smallLogo : largeLogo}
          alt=""
          className="w-10/12 max-h-80 sm:w-96 2xl:w-[500px]"
        />
      </header>
      <section className="w-full sm:w-[600px] lg:w-[800px]">
        <div className="-mt-14 text-center text-sm sm:text-base lg:text-lg sm:py-2 w-full mb-8">
          <p>
            This service let’s you transform your favorite VS code color theme
            to a Visual Studio theme. Full instructions can be found at our
            <i>
              <a
                target="blank"
                href="https://github.com/NUB31/vscode_vs_theme_converter"
                className="text-[#3BA8F2] no-underline font-semibold"
              >
                &nbsp;github repo
              </a>
            </i>
            . There you can also find all the sources used for this project and
            all the contributors that have participated.
          </p>
        </div>
        <div className="flex justify-center items-center flex-col w-full -z-20">
          <div
            {...getRootProps()}
            className="flex justify-center items-center flex-col w-full"
          >
            <div
              className={`${
                isDragActive
                  ? "border-green-600 shadow-[inset_0_0_7px_2px_#c0c0c0]"
                  : "border-[#1F2743] hover:shadow-[inset_0_0_7px_2px_#c0c0c0]"
              } border-dashed border-2 cursor-pointer transition-all rounded-md grow w-full h-56 flex justify-center items-center`}
            >
              <input {...getInputProps()} multiple={false} />
              <div className="flex justify-center items-center flex-col w-full">
                <div className="flex justify-center w-1/4">
                  <img
                    src={checkMark ? checkMarkIcon : uploadIcon}
                    alt=""
                    className={`${
                      isDragActive ? "scale-90 greenFilter" : "scale-100"
                    } w-6/12 xl:w-6/12 transition-all`}
                  />
                </div>
                <p
                  className={`${
                    isDragActive
                      ? "scale-90 greenFilter opacity-100"
                      : "scale-100 opacity-50"
                  }
                  transition-all text-center text-base md:text-xl 2xl:text-2xl `}
                >
                  {file ? file.name : "Click or drop your .JSON file here"}
                </p>
              </div>
            </div>
          </div>
          <button
            className="mt-12 bg-[#0086e6] text-[#FEFDFA] py-4 px-8 cursor-pointer flex justify-center items-center text-center w-[30%] rounded-md 2xl:text-xl hover:shadow-[inset_0_0_7px_2px_#0066b1] transition-shadow"
            onClick={() => sendFile(file)}
          >
            <div className="flex justify-center items-center">Convert</div>
          </button>
          <button className="mt-6 bg-[#8852f5] text-[#FEFDFA] p-4 cursor-pointer flex justify-center items-center text-center w-[30%] rounded-md 2xl:text-xl hover:shadow-[inset_0_0_7px_2px_#6b40c2] transiton-shadow">
            <a
              className="no-underline w-full h-full text-white"
              target="blank"
              href="https://www.paypal.com/donate/?hosted_button_id=8V92MCWYK43CQ"
            >
              Donate 👉👈
            </a>
          </button>
          <a ref={dwnBtnRef} id="downloadLink" href=""></a>
        </div>
      </section>
      <LoadingBar
        color={progress >= 91 ? "#2ea043" : "#47ADF3"}
        progress={progress}
        waitingTime={3000}
        onLoaderFinished={() => {}}
        height={5}
      />
    </div>
  );
}
