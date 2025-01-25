import axios from "axios";
import { useEffect, useRef, useState } from "react";
import LanguageHeader from "./LanguageHeader";
import Loader from "./Loader";
import LanguageDropdown from "./LanguageDropdown";

// Language options map with language labels and codes
const languageOptions = new Map<string, { label: string; code: string }>([
  ["auto", { label: "Phát hiện ngôn ngữ", code: "auto" }],
  ["ja", { label: "Tiếng Nhật", code: "ja" }],
  ["sv", { label: "Tiếng Thụy Điển", code: "sv" }],
  ["ar", { label: "Tiếng Ả Rập", code: "ar" }],
  ["uz", { label: "Tiếng Uzbek", code: "uz" }],
  ["mt", { label: "Tiếng Malta", code: "mt" }],
  ["fy", { label: "Tiếng Frisia", code: "fy" }],
  ["et", { label: "Tiếng Estonia", code: "et" }],
  ["ms", { label: "Tiếng Mã Lai", code: "ms" }],
  ["hu", { label: "Tiếng Hungary", code: "hu" }],
  ["la", { label: "Tiếng La-tinh", code: "la" }],
  ["cy", { label: "Tiếng Wales", code: "cy" }],
  ["mi", { label: "Tiếng Mãori", code: "mi" }],
  ["is", { label: "Tiếng Iceland", code: "is" }],
  ["haw", { label: "Tiếng Hawaii", code: "haw" }],
  ["zh-CN", { label: "Tiếng Trung (Giản Thể)", code: "zh-CN" }],
  ["vi", { label: "Tiếng Việt", code: "vi" }],
  ["en", { label: "Tiếng Anh", code: "en" }],
]);

const sortedLanguageArray = Array.from(languageOptions.entries()).sort(
  ([, a], [, b]) => a.label.localeCompare(b.label, "vi") // Use 'vi' locale for proper sorting
);

// Enum to differentiate between source and target languages
enum LanguageType {
  SOURCE = "source",
  TRANSLATE = "translate",
}

function TranslateBox() {
  // State variables for source language, target language, and texts
  const [sourceLanguage, setSourceLanguage] = useState<string>("auto");
  const [translateLanguage, setTranslateLanguage] = useState<string>("en");
  const [sourceText, setSourceText] = useState<string>("");
  const [translateText, setTranslateText] = useState<string>("");
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<{
    isOpen: boolean;
    type: LanguageType | null;
  }>({ isOpen: false, type: null });

  const [showDots, setShowDots] = useState<boolean>(false); // Show loading dots

  const textareaRef = useRef<HTMLTextAreaElement>(null); // Reference to the textarea
  const latestRequestId = useRef<number>(0);

  // Load state from chrome.storage
  const loadState = () => {
    chrome.storage.local.get("popupState", (data) => {
      if (chrome.runtime.lastError) {
        console.error("Error loading state:", chrome.runtime.lastError.message);
      } else {
        console.log("Data loaded:", data);
        if (data.popupState) {
          console.log("State found!");
          setSourceLanguage(data.popupState.sourceLanguage);
          setTranslateLanguage(data.popupState.translateLanguage);
        } else {
          console.log("No state found");
        }
      }
    });
  };

  // Focus on the textarea when the component loads
  useEffect(() => {
    loadState();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Handle translation logic whenever relevant states change
  useEffect(() => {
    const translateTextFunction = async (currentRequestId: number) => {
      // Only translate if there is source text
      if (sourceText.trim().length !== 0) {
        try {
          // Call Google Translate API
          const response = await axios.get(
            `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sourceLanguage}&tl=${translateLanguage}&q=${encodeURIComponent(
              sourceText
            )}`
          );
          // Update the translated text based on the source language
          // Only process the response if latest request
          if (currentRequestId === latestRequestId.current) {
            if (sourceLanguage != "auto") {
              setTranslateText(response.data[0]);
              setDetectedLanguage("");
            } else {
              setTranslateText(response.data[0][0]);
              setDetectedLanguage(response.data[0][1]);
              console.log(response.data[0][0]);
              // console.log(response.data[0][1]);
            }
          }
        } catch (error: unknown) {
          if (
            axios.isAxiosError(error) &&
            (!error.response || error.code === "ECONNABORTED")
          ) {
            // Network error
            console.error("Network error:", error.message);
            setError("Network error");
          } else if (error instanceof Error) {
            // General exceptions
            console.error("Exception occurred:", error.message);
            setError(error.message);
          }
        } finally {
          setShowDots(false); // Stop showing loading dots
        }
      } else {
        setDetectedLanguage("");
      }
    };

    // Debounce the translation function to prevent excessive API calls
    const timeoutId = setTimeout(() => {
      if (sourceText.trim().length != 0 && translateText.trim().length === 0) {
        setTranslateText("Đang dịch"); // Show "Translating" text
        setShowDots(true); // Show loading dots
      } else if (
        sourceText.trim().length != 0 &&
        translateText.trim().length != 0
      ) {
        setShowDots(true); // Keep dots if both texts exist
      } else if (sourceText.trim().length == 0) {
        setTranslateText(""); // Clear translation if no input text
      }
      latestRequestId.current += 1;
      translateTextFunction(latestRequestId.current);
    }, 150); // 150ms debounce delay

    return () => {
      clearTimeout(timeoutId); // Cleanup timeout on re-render
    };
  }, [sourceText, sourceLanguage, translateLanguage]);

  // Handle input change in the source textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setError("");
    setSourceText(e.target.value);
  };

  // Clear the source text
  const handleClearClick = () => {
    setSourceText("");
    setDetectedLanguage("");
  };

  // Swap source and target languages
  const handleSwapLanguage = () => {
    let temp: string = sourceLanguage;
    if (sourceLanguage === "auto" && detectedLanguage) {
      temp = detectedLanguage;
      setDetectedLanguage("");
    }

    setSourceLanguage(translateLanguage);
    setTranslateLanguage(temp);
    setSourceText(translateText); // Swap texts

    // Save the updated state back to chrome storage
    chrome.storage.local.set(
      {
        popupState: {
          sourceLanguage: translateLanguage,
          translateLanguage: temp,
        },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error saving state:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("State saved successfully!");
        }
      }
    );

    // If there's translated text, show the "Translating" status
    if (translateText.trim().length != 0 && translateText != sourceText) {
      setTranslateText("Đang dịch");
      setShowDots(true);
    }
  };

  return (
    <>
      {showDropdown.isOpen && (
        <LanguageDropdown
          type={showDropdown.type}
          selectedLanguage={
            showDropdown.type === LanguageType.SOURCE
              ? sourceLanguage
              : translateLanguage
          }
          setLanguage={
            showDropdown.type === LanguageType.SOURCE
              ? setSourceLanguage
              : setTranslateLanguage
          }
          setShowDropdown={setShowDropdown}
          languageOptions={
            showDropdown.type === LanguageType.SOURCE
              ? sortedLanguageArray
              : sortedLanguageArray.filter((lang) => lang[1].code !== "auto")
          }
          textareaRef={textareaRef}
        />
      )}

      <div
        className={`translate-box py-2 px-3 ${
          showDropdown.isOpen ? "opacity-0" : ""
        }`}
      >
        {/* Language selection */}
        <div className="translate-header h-[30px] w-full flex flex-row">
          {/* Source language dropdown */}
          {/* <select
          className="source-language h-[25px] w-[200px] rounded-md border-[#DADCE0] border-solid border-[1px] px-2 cursor-pointer outline-none"
          value={sourceLanguage}
          onChange={(e) => handleChangeLanguage(e, LanguageType.SOURCE)}
        > */}
          {/* If sourceLanguage is auto, modify the label dynamically */}
          {/* <option value="auto">
            {detectedLanguage
              ? `${languageOptions.get(detectedLanguage)?.label} - Đã phát hiện`
              : "Phát hiện ngôn ngữ"}
          </option>

          {/* Render the rest of the language options */}
          {/* {sortedLanguageArray
            .filter(([key]) => key !== "auto") // Exclude "auto" since it's already handled
            .map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))} */}
          {/* </select> */}

          <div
            className="cursor-pointer"
            onClick={() => {
              setShowDropdown({ isOpen: true, type: LanguageType.SOURCE });
            }}
          >
            <LanguageHeader
              language={languageOptions.get(sourceLanguage)}
              type={LanguageType.SOURCE}
              detectedLanguageLabel={
                languageOptions.get(detectedLanguage)?.label
              }
            />
          </div>

          {/* Swap languages button */}
          {(sourceLanguage === "auto" && !detectedLanguage) || showDots ? (
            <div className="px-[10px] cursor-pointer" title="Hoán đổi ngôn ngữ">
              <img
                src="/svg/swap.svg"
                className="w-[24px] h-[24px] opacity-35"
              />
            </div>
          ) : (
            <div
              className="px-[10px] cursor-pointer"
              title="Hoán đổi ngôn ngữ"
              onClick={handleSwapLanguage}
            >
              <img src="/svg/swap.svg" className="w-[24px] h-[24px]" />
            </div>
          )}

          {/* Target language dropdown */}
          <div
            className="cursor-pointer"
            onClick={() => {
              setShowDropdown({ isOpen: true, type: LanguageType.TRANSLATE });
            }}
          >
            <LanguageHeader
              language={languageOptions.get(translateLanguage)}
              type={LanguageType.TRANSLATE}
            />
          </div>
        </div>

        {/* Input and output text areas */}
        <div className="translate-body w-full h-[100px] flex flex-row">
          {/* Source text area */}
          <div className="py-1 pl-2 pr-6 relative">
            <textarea
              className="w-[168px] h-full resize-none outline-none placeholder:font-bold placeholder:text-[#757575]"
              placeholder="Nhập, nói hoặc chụp ảnh"
              value={sourceText}
              onChange={handleInputChange}
              ref={textareaRef}
            ></textarea>
            {sourceText.length != 0 && (
              <button
                className="w-[18px] h-[18px] absolute right-[2px] mt-[2px]"
                onClick={handleClearClick}
              >
                <img src="/svg/close.svg"></img>
              </button>
            )}
          </div>

          {/* Spacer */}
          <div className="w-[44px] h-full gap-block"></div>

          {/* Translation output */}
          <div className="w-[200px] h-full max-h-full py-1 px-2 bg-[#F8F9FA] overflow-y-auto">
            {error ? (
              // Show error message if an error exists
              <>
                <svg
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-[18px] h-[18px] text-red-500 inline-block mr-1 mb-[0.5px]"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                    className="fill-current"
                  />
                </svg>
                <span className="text-red-500 font-bold">{error}</span>
              </>
            ) : sourceText.trim().length !== 0 ? (
              // Show translation or loading dots if there is source text
              <>
                {translateText.trim().length !== 0 ? (
                  <span className="text-[#5E5E5E] font-bold whitespace-pre-wrap break-words">
                    {translateText}
                  </span>
                ) : (
                  <span className="text-[#5E5E5E] font-bold whitespace-pre-wrap break-words">
                    Đang dịch
                  </span>
                )}
                {showDots && <Loader />} {/* Show loader if dots are active */}
              </>
            ) : (
              // Default placeholder when no source text
              <span className="text-[#5E5E5E] font-bold">Bản dịch</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TranslateBox;
