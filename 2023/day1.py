# Something is wrong with global snow production, and you've been selected to take a look. The Elves have even given you a map; on it, they've used stars to mark the top fifty locations that are likely to be having problems.

# You've been doing this long enough to know that to restore snow operations, you need to check all fifty stars by December 25th.

# Collect stars by solving puzzles. Two puzzles will be made available on each day in the Advent calendar; the second puzzle is unlocked when you complete the first. Each puzzle grants one star. Good luck!

# You try to ask why they can't just use a weather machine ("not powerful enough") and where they're even sending you ("the sky") and why your map looks mostly blank ("you sure ask a lot of questions") and hang on did you just say the sky ("of course, where do you think snow comes from") when you realize that the Elves are already loading you into a trebuchet ("please hold still, we need to strap you in").

# As they're making the final adjustments, they discover that their calibration document (your puzzle input) has been amended by a very young Elf who was apparently just excited to show off her art skills. Consequently, the Elves are having trouble reading the values on the document.

# The newly-improved calibration document consists of lines of text; each line originally contained a specific calibration value that the Elves now need to recover. On each line, the calibration value can be found by combining the first digit and the last digit (in that order) to form a single two-digit number.

# For example:

# 1abc2
# pqr3stu8vwx
# a1b2c3d4e5f
# treb7uchet
# In this example, the calibration values of these four lines are 12, 38, 15, and 77. Adding these together produces 142.

# Consider your entire calibration document. What is the sum of all of the calibration values?

def find_positions(input_str: str) -> list[int]:
    indexes = []
    index = input_str.find("one")
    while index != -1:
        indexes.append({"num":1, "loc": index})
        index = input_str.find("one", index + 1)
    index = input_str.find("two")
    while index != -1:
        indexes.append({"num":2, "loc": index})
        index = input_str.find("two", index + 1)
    index = input_str.find("three")
    while index != -1:
        indexes.append({"num":3, "loc": index})
        index = input_str.find("three", index + 1)
    index = input_str.find("four")
    while index != -1:
        indexes.append({"num":4, "loc": index})
        index = input_str.find("four", index + 1)
    index = input_str.find("five")
    while index != -1:
        indexes.append({"num":5, "loc": index})
        index = input_str.find("five", index + 1)
    index = input_str.find("six")
    while index != -1:
        indexes.append({"num":6, "loc": index})
        index = input_str.find("six", index + 1)
    index = input_str.find("seven")
    while index != -1:
        indexes.append({"num":7, "loc": index})
        index = input_str.find("seven", index + 1)
    index = input_str.find("eight")
    while index != -1:
        indexes.append({"num":8, "loc": index})
        index = input_str.find("eight", index + 1)
    index = input_str.find("nine")
    while index != -1:
        indexes.append({"num":9, "loc": index})
        index = input_str.find("nine", index + 1)
    return indexes

def digit_convert(input_str: str) -> str:
    indexes = find_positions(input_str)
    items = [item for item in indexes if item.get("loc") >= 0]
    items.sort(reverse=True, key=lambda x: x.get("loc"))
    line = list(input_str)  # convert line to list
    for item in items:
        line.insert(item.get("loc"), str(item.get("num")))  # insert char at index
    # remove letters now
    line = [item for item in line if item.isdigit()]
    output_str = "".join(line)
    print(f"{input_str}:{output_str}")
    return output_str

# Open the file and store the file handle in f
f = open("day1.input.txt", "r")

# Read the file line by line
total = 0
for line in f:
    first_digit = None
    last_digit = None
    line = digit_convert(line)
    for char in line:
        # do something with char
        if char.isdigit():
            if first_digit is None:
                first_digit = int(char)
            last_digit = int(char)
    subtotal = (first_digit * 10) + last_digit
    total = total + subtotal

print(total)

# Always close the file when done
f.close()
