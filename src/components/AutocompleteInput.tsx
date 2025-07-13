import { useState, useRef, useEffect } from "react";
import { WorkspaceVariable } from "../types/workspace";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  variables: WorkspaceVariable[];
  onEnterPress?: () => void;
}

interface Suggestion {
  variable: WorkspaceVariable;
  matchStart: number;
  matchEnd: number;
}

export function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
  style,
  variables,
  onEnterPress,
}: AutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Analyser le texte pour trouver les variables potentielles
  const findVariableSuggestions = (text: string, cursor: number): Suggestion[] => {
    if (!text || cursor < 0) return [];

    // Trouver le mot actuel à la position du curseur
    const beforeCursor = text.substring(0, cursor);
    const afterCursor = text.substring(cursor);
    
    // Regex pour trouver le début du mot (lettres, chiffres, underscore)
    const wordMatch = beforeCursor.match(/([A-Z_][A-Z0-9_]*)$/i);
    
    if (!wordMatch) return [];
    
    const partialWord = wordMatch[1];
    const matchStart = cursor - partialWord.length;
    const matchEnd = cursor;
    
    // Filtrer les variables qui commencent par le mot partiel
    const matchingVariables = variables.filter(variable =>
      variable.name.toLowerCase().startsWith(partialWord.toLowerCase()) &&
      variable.name.toLowerCase() !== partialWord.toLowerCase() // Exclure les matches exacts
    );
    
    return matchingVariables.map(variable => ({
      variable,
      matchStart,
      matchEnd,
    }));
  };

  // Mettre à jour les suggestions quand le texte ou la position change
  useEffect(() => {
    const newSuggestions = findVariableSuggestions(value, cursorPosition);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedIndex(0);
  }, [value, cursorPosition, variables]);

  // Gérer les changements de texte
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCursorPosition(e.target.selectionStart || 0);
  };

  // Gérer la position du curseur
  const handleSelectionChange = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

  // Insérer une variable sélectionnée
  const insertVariable = (suggestion: Suggestion) => {
    const beforeMatch = value.substring(0, suggestion.matchStart);
    const afterMatch = value.substring(suggestion.matchEnd);
    const newValue = beforeMatch + suggestion.variable.name + afterMatch;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Repositionner le curseur après l'insertion
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = suggestion.matchStart + suggestion.variable.name.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        inputRef.current.focus();
      }
    }, 0);
  };

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si l'autocomplétion est active et qu'il y a des suggestions
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          insertVariable(suggestions[selectedIndex]);
          break;
        case "Escape":
          setShowSuggestions(false);
          break;
      }
    } else {
      // Si l'autocomplétion n'est pas active
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          // Déclencher l'envoi de la requête si la fonction est fournie
          onEnterPress?.();
          break;
        case "Escape":
          // Nettoyer les suggestions si elles existent encore
          setShowSuggestions(false);
          break;
      }
    }
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelectionChange}
        onFocus={handleSelectionChange}
        placeholder={placeholder}
        className={`w-full ${className}`}
        style={style}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.variable.id}
              className="px-4 py-2 cursor-pointer border-b last:border-b-0 hover:opacity-100 transition-all"
              style={{
                backgroundColor: index === selectedIndex ? "var(--muted)" : "transparent",
                borderBottomColor: "var(--border)",
                opacity: index === selectedIndex ? 1 : 0.85,
              }}
              onClick={() => insertVariable(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-sm font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  {suggestion.variable.name}
                </span>
                <span
                  className="text-sm truncate ml-2 max-w-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {suggestion.variable.value}
                </span>
              </div>
              {suggestion.variable.description && (
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {suggestion.variable.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}