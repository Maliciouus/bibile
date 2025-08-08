import { useSearchParams } from "react-router-dom";
import CreateTopic from "./createtopic";
import CreateQuestion from "./codquestion";
import CreateSubTopic from "./createsubtopic";

export default function CodLayout() {
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const topicId = searchParams.get("topic");
  const topic = searchParams.get("topicName");
  const subtopic = searchParams.get("subtopic");

  return (
    <>
      {!type || type == "createtopic" ? (
        <CreateTopic />
      ) : type == "createquestion" && topicId && topic ? (
        <CreateQuestion />
      ) : type == "subtopic" && subtopic ? (
        <CreateSubTopic />
      ) : (
        <>Nah</>
      )}
    </>
  );
}
