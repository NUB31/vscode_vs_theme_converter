import arrowRightIcon from "../img/arrow-right.svg";
import { useToggle } from "../hooks/useToggle";
import { v4 as uuid } from "uuid";

export type log = {
  message: string;
  status: "success" | "info" | "error";
};

export default function DrawerLogs({ logs }: { logs: log[] }) {
  const [drawerOpen, toggleDrawerOpen] = useToggle(false);

  return (
    <div
      className={`${
        drawerOpen ? "right-0" : "-right-96"
      } h-screen w-96 py-8 fixed bg-[#f8f8f8] shadow-xl transition-all px-6 z-50`}
    >
      <h3 className="font-bold text-lg mb-2 text-center">Logs</h3>
      <ul className="overflow-y-auto list-none w-full h-full ">
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
              key={uuid()}
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
