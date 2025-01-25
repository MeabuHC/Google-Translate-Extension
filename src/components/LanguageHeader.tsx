// Enum to differentiate between source and target languages
enum LanguageType {
  SOURCE = "source",
  TRANSLATE = "translate",
}

type LanguageHeaderProps = {
  language:
    | {
        label: string;
        code: string;
      }
    | undefined;
  type: LanguageType;
  detectedLanguageLabel?: string;
};

function LanguageHeader(props: LanguageHeaderProps) {
  return (
    <div className="source-language h-[30px] w-[200px] rounded-md border-[#DADCE0] border-solid border-[1px] px-2 outline-none flex items-center relative">
      <span className="text-[#1A0DAB] overflow-hidden whitespace-nowrap">
        {props.detectedLanguageLabel
          ? `${props.detectedLanguageLabel} - Đã phát hiện`
          : props.language?.label}
      </span>

      <svg
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="text-[#1A0DAB] w-[20px] h-[20px] ml-auto"
      >
        <path d="M7 10l5 5 5-5z" className="fill-current"></path>
      </svg>
    </div>
  );
}

export default LanguageHeader;
