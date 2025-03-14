import { Button } from "./ui/button";
import { TextArea } from "./ui/text-area";

const Comments = ({}) => {
  return (
    <div className="w-2/3 flex flex-col gap-5">
      <div className="w-full rounded-lg bg-card relative pb-10">
        <TextArea
          className="w-full h-full resize-none px-10 py-8 text-sm"
          rows={2}
          placeholder="Add comment..."
        />
        <Button className="absolute bottom-3 right-5">Submit</Button>
      </div>
      <div className="w-full h-[2px] bg-card"></div>
      <div className="py-4 pl-8 rounded-md flex justify-between">
        <h2>Comments</h2>
      </div>
    </div>
  );
};

export default Comments;
