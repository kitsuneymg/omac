import { useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css";

function App() {
  const [total, setTotal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (acceptedFiles: File[]) =>
    startTransition(async () => {
      const currentYear = String(new Date().getFullYear());
      let total = 0;

      const files = await Promise.all(
        [...(acceptedFiles ?? [])]?.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.readAsText(file);
              reader.onload = (ev) => {
                const { result } = ev.target ?? {};
                if (typeof result === "string") resolve(result);
              };
            })
        )
      );

      files.forEach((file) => {
        try {
          const parsed = JSON.parse(file);
          const { Score } = parsed;
          if (Score.DateTime.startsWith(currentYear)) {
            Object.entries(Score.TapNoteScores ?? {}).forEach(
              ([label, value]) => {
                if (label.match(/^W[0-9]+$/)) {
                  total += value as number;
                }
              }
            );
          }
        } catch (_) {
          return;
        }
      });

      setTotal(total);
    });

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: handleChange,
  });

  return (
    <>
      <div
        {...getRootProps({
          className: "dropzone",
        })}
      >
        <input
          {...getInputProps({
            accept: ".json,application/json",
            directory: "true",
            disabled: isPending,
            multiple: true,
            webkitdirectory: "true",
          })}
        />
        <div className="contents">
          <h1>One Million Arrows Challenge</h1>
          {total == null ? (
            <div className="instructions">
              <ol>
                <li>
                  Enable custom scores:{" "}
                  <i>Options &gt; Simply Love &gt; Write Custom Scores</i>
                  <ul>
                    <li>
                      If you just enabled custom scores, play a song or two
                    </li>
                  </ul>
                </li>
                <li>
                  Go to your ITGmania save folder
                  <ul>
                    <li>
                      Windows: <code>%APPDATA%/ITGmania/Save</code>
                    </li>
                    <li>
                      Linux: <code>~/.itgmania/Save</code>
                    </li>
                    <li>
                      macOS: <code>~/Library/Preferences/ITGmania</code>
                    </li>
                  </ul>
                </li>
                <li>
                  Go to <code>LocalProfiles/00000000</code> inside the save
                  folder, replacing the 0's with the correct number for your
                  profile
                </li>
                <li>
                  Drag the <code>SL-Scores</code> folder onto this window, or{" "}
                  <button onClick={open} type="button">
                    click here
                  </button>{" "}
                  to navigate to it
                </li>
              </ol>
            </div>
          ) : (
            <div className="count">
              You hit
              <div className="total">{total.toLocaleString()}</div>
              arrow{total === 1 ? "" : "s"} this year!
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
