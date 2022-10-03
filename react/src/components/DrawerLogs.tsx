import arrowRightIcon from "../img/arrow-right.svg";
import { useRef } from "react";
import { useToggle } from "../hooks/useToggle";

export default function DrawerLogs({
  logs,
}: {
  logs: { message: string; status: string }[];
}) {
  const logsList = useRef<HTMLUListElement>(null);
  const [drawerOpen, toggleDrawerOpen] = useToggle(false);

  function log(message: any, type: any) {
    let item = document.createElement("li");
    item.style.border = "1px solid gray";
    item.innerHTML = message;
    item.style.color =
      type === "success"
        ? "green"
        : type === "error"
        ? "red"
        : type === "info"
        ? "blue"
        : "lightgray";
    if (logsList.current) {
      logsList.current.appendChild(item);
      logsList.current.scrollTop = logsList.current.scrollHeight;
    }
  }

  return (
    <div
      className={`${
        drawerOpen ? "right-0" : "-right-96"
      } h-screen w-96 py-8 fixed bg-[#f8f8f8] shadow-xl transition-all px-6`}
    >
      <h3 className="font-bold text-lg mb-2 text-center">Logs</h3>
      <ul ref={logsList} className="overflow-y-auto list-none w-full h-full ">
        {logs &&
          logs.map(({ status, message }) => (
            <li
              style={{
                backgroundColor:
                  status === "success"
                    ? "lightgreen"
                    : status === "error"
                    ? "indianred"
                    : status === "info"
                    ? "lightblue"
                    : "lightgray",
                color: status === "error" ? "white" : "black",
              }}
              className={`rounded-md p-3 mb-2 bg-white border-gray-500 border-2`}
              dangerouslySetInnerHTML={{ __html: message }}
            ></li>
          ))}
      </ul>
      <button
        className={`${
          drawerOpen ? "-translate-x-3/4" : "-translate-x-1/2"
        } absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-[#0086e6] rounded-full flex justify-center items-center cursor-pointer transition-all`}
        onClick={toggleDrawerOpen}
      >
        <img
          className={`${
            drawerOpen ? "rotate-180" : "-translate-x-2"
          } w-1/2 transition-all`}
          src={arrowRightIcon}
          alt=""
        />
      </button>
    </div>
  );
}
