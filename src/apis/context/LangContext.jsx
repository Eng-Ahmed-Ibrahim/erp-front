import { createContext } from "react";
export const LangContext = createContext();

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { setLang } = useContext(LangContext);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLang(lang);
  };
};
