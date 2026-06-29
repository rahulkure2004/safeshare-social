import csv
import unicodedata
import sys

# Define Unicode ranges for emojis
EMOJI_RANGES = [
    (0x1F600, 0x1F64F),  # Emoticons
    (0x1F300, 0x1F5FF),  # Misc Symbols and Pictographs
    (0x1F900, 0x1F9FF),  # Supplemental Symbols and Pictographs
    (0x1FA70, 0x1FAFF),  # Symbols and Pictographs Extended-A
    (0x1F680, 0x1F6FF),  # Transport and Map Symbols
    (0x2600, 0x26FF),    # Misc Symbols
    (0x2700, 0x27BF),    # Dingbats
]

def get_emoji_dataset():
    dataset = []
    for start, end in EMOJI_RANGES:
        for codepoint in range(start, end + 1):
            char = chr(codepoint)
            try:
                name = unicodedata.name(char)
                # Filter to characters that are typically emojis or symbols
                # We can refine the name formatting to make it a user-friendly meaning
                meaning = name.title()
                dataset.append((char, meaning))
            except ValueError:
                # Character has no Unicode name
                continue
    return dataset

def main():
    print("Generating emoji dataset...")
    dataset = get_emoji_dataset()
    print(f"Found {len(dataset)} emoji characters.")
    
    csv_path = "public/datasets/emoji_dataset.csv"
    with open(csv_path, mode="w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["emoji", "meaning"])
        for char, meaning in dataset:
            writer.writerow([char, meaning])
            
    print(f"Successfully wrote dataset to {csv_path}")

if __name__ == "__main__":
    main()
