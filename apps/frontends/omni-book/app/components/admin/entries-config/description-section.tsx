import { TextArea } from "~/components/ui/text-area";
import type {
  EntryFormData,
  FormattedEntryErrors,
} from "~/schemas/entry-schema";

export type DescriptionSectionValues = Pick<EntryFormData, "description">;

type DescriptionSectionProps = {
  handleChange: (field: keyof EntryFormData, value: unknown) => void;
  errors: FormattedEntryErrors | undefined;
  touchedFields: Record<string, boolean>;
  values?: DescriptionSectionValues;
};
const DescriptionSection = ({
  handleChange,
  errors,
  touchedFields,
  values,
}: DescriptionSectionProps) => {
  return (
    <div className="flex w-full gap-4">
      <div className="w-1/4">
        <h1 className="text-xl font-medium">Description</h1>
        <h4 className="text-sm font-light">
          Add the synopsis or a general description of the book
        </h4>
      </div>
      <div className="flex-1">
        <TextArea
          className="resize-none w-full px-4 py-4 text-sm bg-card-secondary"
          rows={7}
          placeholder="Add description..."
          name="description"
          onChange={(e) => handleChange("description", e.target.value)}
          defaultValue={values?.description}
        />
        {touchedFields.description && errors?.description && (
          <p className="text-red-500 text-xs">
            {errors?.description._errors[0].toString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default DescriptionSection;
