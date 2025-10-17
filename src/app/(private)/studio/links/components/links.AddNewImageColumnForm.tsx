"use client";

import AddNewImageForm from "./links.AddNewImageForm";
import type { ImageFormData } from "../hooks/useLinksManager";
import type { SectionItem } from "../types/links.types";

interface Props {
  formData: ImageFormData;
  setFormData: (data: ImageFormData) => void;
  onSave: () => void;
  onCancel?: () => void;
  isSaveDisabled?: boolean;
  existingSections?: SectionItem[];
}

const AddNewImageColumnForm = ({
  formData,
  setFormData,
  onSave,
  onCancel,
  isSaveDisabled,
  existingSections,
}: Props) => {
  const enforced = { ...formData, layout: "column" as const };
  const handleSet = (d: ImageFormData) => setFormData({ ...d, layout: "column" });
  return (
    <AddNewImageForm
      existingSections={existingSections}
      formData={enforced}
      isSaveDisabled={isSaveDisabled}
      maxImages={10}
      onCancel={onCancel}
      onSave={onSave}
      setFormData={handleSet}
    />
  );
};

export default AddNewImageColumnForm;