import { Form } from "react-router";
import { Button } from "./ui/button";

export const AddNodeForm = () => {
  return (
    <Form action="/api/peer-nodes" method="POST">
      <div className="flex flex-col gap-2 my-4">
        <label className="flex items-center gap-4 justify-between w-full text-sm border-none">
          <p>Hostname</p>
          <input
            name="hostname"
            type="text"
            className="px-4 py-2 w-2/3 bg-card-secondary rounded-lg outline-none"
            placeholder="google.com"
          />
        </label>
        <label className="flex items-center gap-4 justify-between w-full text-sm">
          <p>Trusted Level</p>
          <select
            name="trustLevel"
            className="px-4 border-r-8 border-r-transparent py-2 w-2/3 bg-card-secondary rounded-lg outline-none"
            defaultValue="trusted"
          >
            <option value="trusted" className="hover:bg-black">
              trusted
            </option>
            <option value="semi-trusted">semi-trusted</option>
          </select>
        </label>
      </div>
      <div className="flex gap-2 w-full justify-end">
        <label
          htmlFor={"add-node-button"}
          className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-primary text-primary bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8 py-4"
        >
          Cancel
        </label>
        <Button type="submit">Submit</Button>
      </div>
    </Form>
  );
};
