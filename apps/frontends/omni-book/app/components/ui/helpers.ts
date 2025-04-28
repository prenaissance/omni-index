import type { StylesConfig } from "react-select";

type SelectOption = {
  value: string;
  label: string;
};

export const selectStyles: StylesConfig<SelectOption> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "card-secondary",
    fontSize: "0.875rem",
    paddingLeft: "0.5rem",
    paddingTop: "4px",
    paddingBottom: "4px",
    border: "none",
    outline: "none",
    boxShadow: "none",
    cursor: "pointer",
  }),
  option: (styles) => ({
    ...styles,
    backgroundColor: "#404040",
    ":hover": {
      backgroundColor: "#2f796e",
      cursor: "pointer",
    },
    fontSize: "0.875rem",
    paddingLeft: "1rem",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#404040",
    borderRadius: "7px",
  }),
  container: (styles) => ({
    ...styles,
    borderRadius: "7px",
    outline: "none",
  }),
  placeholder: (styles) => ({
    ...styles,
    color: "#a9a9a9",
  }),
  multiValue: (styles) => ({
    ...styles,
    backgroundColor: "#2f796e",
    borderRadius: "3px",
    color: "#fff",
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: "#fff",
  }),
  input: (styles) => ({
    ...styles,
    color: "#fff",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "#fff",
  }),
};
