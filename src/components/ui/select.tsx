import * as React from 'react';

export const Select = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState('');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-slate-50"
      >
        {selectedLabel || children}
        <span className="ml-2">▼</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {React.Children.map(
              React.Children.toArray(
                React.Children.toArray(children).find(
                  (child) =>
                    React.isValidElement(child) && child.type === SelectValue
                )
              )[0],
              () => null
            )}
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === SelectContent) {
                return React.Children.map(child.props.children, (item) => {
                  if (React.isValidElement(item) && item.type === SelectItem) {
                    return React.cloneElement(
                      item as React.ReactElement<any>,
                      {
                        onClick: () => {
                          onValueChange?.(item.props.value);
                          setSelectedLabel(item.props.children);
                          setOpen(false);
                        },
                        isSelected: value === item.props.value,
                      }
                    );
                  }
                  return item;
                });
              }
              return null;
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const SelectValue = ({ placeholder }: { placeholder: string }) => {
  return <span className="text-gray-500">{placeholder}</span>;
};

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const SelectItem = ({
  value,
  children,
  onClick,
  isSelected,
}: {
  value: string;
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 cursor-pointer hover:bg-slate-100 ${
        isSelected ? 'bg-slate-100 font-semibold' : ''
      }`}
    >
      {children}
    </div>
  );
};