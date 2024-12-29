import { ChangeEvent, useState, useTransition } from "react";
import "./App.css";

function App() {
  const [total, setTotal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    startTransition(async () => {
      let total = 0;

      const files = await Promise.all(
        [...(event.target.files ?? [])]?.map(
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
        const score = JSON.parse(file);
        Object.entries(score.Score?.TapNoteScores ?? {}).forEach(
          ([label, value]) => {
            if (label.match(/^W[0-9]+$/)) {
              total += value as number;
            }
          }
        );
      });

      setTotal(total);
    });

  return (
    <>
      <div className="dropzone">
        <input
          type="file"
          accept=".json,application/json"
          // @ts-expect-error nonstandard
          directory="true"
          disabled={isPending}
          webkitdirectory="true"
          multiple
          onChange={handleChange}
          onClick={(event) => event.preventDefault()}
        />
      </div>
      {total ? (
        <div className="count">
          You hit
          <div className="total">{total}</div>
          arrow{total === 1 ? "" : "s"} this year!
        </div>
      ) : null}
    </>
  );
}

export default App;