import { Button, TextInput, Label } from "flowbite-react";

interface LinksSectionProps {
  links: string[];
  linkInput: string;
  onLinkInputChange: (value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
}

const LinksSection = ({
  links,
  linkInput,
  onLinkInputChange,
  onAddLink,
  onRemoveLink,
}: LinksSectionProps) => {
  return (
    <div>
      <div className="mb-2 block">
        <Label htmlFor="links" value="Link(s)" />
      </div>
      <div className="flex">
        <TextInput
          id="linkInput"
          value={linkInput}
          onChange={(event) => onLinkInputChange(event.target.value)}
        />
        <Button onClick={onAddLink} className="ml-2">
          Add Link
        </Button>
      </div>
      <ul className="mt-2">
        {links.map((link, index) => (
          <li key={index} className="flex items-center">
            <span>{link}</span>
            <Button
              onClick={() => onRemoveLink(index)}
              className="ml-2"
              size="xs"
              color="red"
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LinksSection;
