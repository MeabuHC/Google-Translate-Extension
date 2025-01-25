import { useEffect, useRef, useState } from "react";

enum LanguageType {
  SOURCE = "source",
  TRANSLATE = "translate",
}

type LanguageDropdownProps = {
  type: LanguageType | null;
  setShowDropdown: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      type: LanguageType | null;
    }>
  >;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  selectedLanguage: string;
  languageOptions: [string, { label: string; code: string }][];
  textareaRef: React.RefObject<HTMLTextAreaElement>;
};

function LanguageDropdown({
  type,
  setShowDropdown,
  setLanguage,
  selectedLanguage,
  languageOptions,
  textareaRef,
}: LanguageDropdownProps) {
  const [searchInput, setSearchInput] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const saveState = (code: string) => {
    // Retrieve the current state from chrome storage
    chrome.storage.local.get("popupState", (data) => {
      if (chrome.runtime.lastError) {
        console.error("Error loading state:", chrome.runtime.lastError.message);
        return;
      }

      let oldPopupState = data.popupState;

      // Default value if oldPopupState is not found
      if (!oldPopupState) {
        console.log("No existing popupState found, setting defaults");
        oldPopupState = {
          sourceLanguage: "auto",
          translateLanguage: "en",
        };
      }

      console.log("Current popupState:", oldPopupState);

      // Prepare the new popupState, preserving existing properties
      const newPopupState = {
        ...oldPopupState, // Spread the existing properties
        ...(type === LanguageType.SOURCE
          ? { sourceLanguage: code } // Update sourceLanguage if type is SOURCE
          : { translateLanguage: code }), // Otherwise, update translateLanguage
      };

      console.log("Saving new popupState:", newPopupState);

      // Save the updated state back to chrome storage
      chrome.storage.local.set({ popupState: newPopupState }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error saving state:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("State saved successfully!");
        }
      });
    });
  };

  // Focus on the input when the component loads
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // Correct reference to the input element
    }
  }, []);

  const filterLanguageOptions = languageOptions.filter((language) => {
    return language[1].label
      .toLowerCase()
      .includes(searchInput.trim().toLowerCase());
  });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveState(filterLanguageOptions[0][0]);
      setLanguage(filterLanguageOptions[0][0]);
      setShowDropdown({ isOpen: false, type: null });
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  return (
    <div className="w-[443px] h-[131px] absolute z-[100] top-[8px] left-[11px]">
      <div className="w-full header flex flex-row">
        <div className="w-[401px] h-[30px] relative">
          <input
            placeholder={`${
              type === LanguageType.SOURCE ? "Dịch từ" : "Dịch sang"
            }`}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-[401px] h-[30px] outline-none rounded-md border-[#DADCE0] border-solid border-[1px] pl-2 pr-8"
            ref={searchInputRef}
          ></input>
          <img
            src="/png/search.png"
            className="w-[20px] h-[20px] absolute top-1/2 right-[4px] transform -translate-y-1/2"
          />
        </div>
        <div
          className="w-[42px] relative px-[11px] py-[5px] cursor-pointer"
          onClick={() => setShowDropdown({ isOpen: false, type: null })}
        >
          <svg
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-[20px] h-[20px]"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </div>
      </div>

      <div className="language-list mt-1 grid grid-cols-3 gap-2 px-2 max-h-[97px] overflow-y-auto">
        {filterLanguageOptions.map(([code, { label }]) => (
          <div
            key={code}
            className={`hover:bg-[#EFEFEF] transition-all duration-100 h-[24px] flex items-center pl-2 rounded-md cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap w-[120px] ${
              selectedLanguage === code && "text-[#1A73E8] font-semibold"
            }`}
            onClick={() => {
              saveState(code);
              setLanguage(code); // Set the selected language code
              setShowDropdown({ isOpen: false, type: null }); // Close the dropdown
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LanguageDropdown;
