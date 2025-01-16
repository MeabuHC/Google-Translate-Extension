type TranslateBoxProps = {
  name: string;
};

function TranslateBox(props: TranslateBoxProps) {
  return <div className="w-[300px] h-[100px]">{props.name}</div>;
}

export default TranslateBox;
