# You and the Elf eventually reach a gondola lift station; he says the gondola lift will take you up to the water source, but this is as far as he can bring you. You go inside.

# It doesn't take long to find the gondolas, but there seems to be a problem: they're not moving.

# "Aaah!"

# You turn around to see a slightly-greasy Elf with a wrench and a look of surprise. "Sorry, I wasn't expecting anyone! The gondola lift isn't working right now; it'll still be a while before I can fix it." You offer to help.

# The engineer explains that an engine part seems to be missing from the engine, but nobody can figure out which one. If you can add up all the part numbers in the engine schematic, it should be easy to work out which part is missing.

# The engine schematic (your puzzle input) consists of a visual representation of the engine. There are lots of numbers and symbols you don't really understand, but apparently any number adjacent to a symbol, even diagonally, is a "part number" and should be included in your sum. (Periods (.) do not count as a symbol.)

# Here is an example engine schematic:

# 467..114..
# ...*......
# ..35..633.
# ......#...
# 617*......
# .....+.58.
# ..592.....
# ......755.
# ...$.*....
# .664.598..
# In this schematic, two numbers are not part numbers because they are not adjacent to a symbol: 114 (top right) and 58 (middle right). Every other number is adjacent to a symbol and so is a part number; their sum is 4361.

# Of course, the actual engine schematic is much larger. What is the sum of all of the part numbers in the engine schematic?

# 517866 is too low (part 1)
# 22920611 is too low (part 2)

def get_number_from_matrix(matrix: list[list[str]], x: int, y: int, direction: str):
    num = []
    if direction == "left":
        starting_x = x
        while starting_x >= 0 and matrix[y][starting_x].isdigit():
            starting_x = starting_x-1
        starting_x = starting_x+1
        while matrix[y][starting_x].isdigit():
            num.append(matrix[y][starting_x])
            starting_x = starting_x + 1
        return int(''.join(num))
    if direction == "right":
        ending_x = x
        while ending_x < len(matrix[y]) and matrix[y][ending_x].isdigit():
            ending_x = ending_x+1
        ending_x = ending_x-1
        while matrix[y][ending_x].isdigit():
            num.append(matrix[y][ending_x])
            ending_x = ending_x - 1
        num.reverse()
        return int(''.join(num))

# Open the file and store the file handle in f
f = open("2023/day3.input.txt", "r")
matrix: list[list[str]] = []
for line in f:
    line = line.replace("\n", "")
    matrix.append(list(line))

total = 0
for i in range(len(matrix)):
    # find gears
    start_digit = -1
    end_digit = -1
    for j in range(len(matrix[i])):
        if str(matrix[i][j]) == '*':#.isdigit():
            nums_found = 0
            nums = []
            # we found a gear, check if at least two sides have a number
            if matrix[i][max(0,j-1)].isdigit():
                nums_found = nums_found + 1
                nums.append(get_number_from_matrix(matrix, j-1, i, direction="left"))
            if matrix[i][min(len(matrix[i]),j+1)].isdigit():
                nums_found = nums_found + 1
                nums.append(get_number_from_matrix(matrix, j+1, i, direction="right"))
            # check 3 top and 3 bottom positions
            largest_x = len(matrix[i])
            largest_y = len(matrix)
            top_left = matrix[max(0,i-1)][max(0, j-1)]
            top_center = matrix[max(0,i-1)][j]
            top_right = matrix[max(0,i-1)][min(j+1, largest_x)]
            bottom_left = matrix[min(largest_y,i+1)][max(0, j-1)]
            bottom_center = matrix[min(largest_y,i+1)][j]
            bottom_right = matrix[min(largest_y,i+1)][min(j+1, largest_x)]
            if top_left.isdigit():
                if top_center.isdigit():
                    nums_found = nums_found + 1
                    nums.append(get_number_from_matrix(matrix, j, i-1, direction="left"))
                elif top_right.isdigit():
                    nums_found = nums_found + 2
                    nums.append(get_number_from_matrix(matrix, j-1, i-1, direction="left"))
                    nums.append(get_number_from_matrix(matrix, j+1, i-1, direction="right"))
                else:
                    nums_found = nums_found + 1
                    nums.append(get_number_from_matrix(matrix, j-1, i-1, direction="left"))
            elif top_right.isdigit():
                nums_found = nums_found + 1
                nums.append(get_number_from_matrix(matrix, j+1, i-1, direction="right"))
            if bottom_left.isdigit():
                if bottom_center.isdigit():
                    nums_found = nums_found + 1
                    nums.append(get_number_from_matrix(matrix, j, i+1, direction="left"))
                elif bottom_right.isdigit():
                    nums_found = nums_found + 2
                    nums.append(get_number_from_matrix(matrix, j-1, i+1, direction="left"))
                    nums.append(get_number_from_matrix(matrix, j+1, i+1, direction="right"))
                else:
                    nums_found = nums_found + 1
                    nums.append(get_number_from_matrix(matrix, j-1, i+1, direction="left"))
            elif bottom_right.isdigit():
                nums_found = nums_found + 1
                nums.append(get_number_from_matrix(matrix, j+1, i+1, direction="right"))
            if nums_found > 1:
                # get gear ratio
                ratio = nums[0] * nums[1]
                total = total + ratio
                print(f"{nums_found} found -> {i}:{j} -> {nums[0]} * {nums[1]} = {ratio} -> cur total = {total}")
        #     if start_digit == -1:
        #         start_digit = j
        #     elif j == len(matrix[i])-1 and end_digit == -1:
        #         end_digit = j
        # else:
        #     if end_digit == -1 and start_digit != -1:
        #         end_digit = j - 1
        # if start_digit >= 0 and end_digit >= 0:
        #     # now that we have a number, check if a symbol exists
        #     for k in range(max(0, i - 1), min(len(matrix), i + 2)):
        #         for m in range(
        #             max(0, start_digit - 1), min(len(matrix[i]), end_digit + 2)
        #         ):
        #             part_num_array = []
        #             if not matrix[k][m].isdigit() and matrix[k][m] != ".":
        #                 # this one counts, find the number
        #                 idx = start_digit
        #                 while idx < end_digit + 1:
        #                     part_num_array.append(matrix[i][idx])
        #                     idx = idx + 1
        #                 part_num = int("".join(part_num_array))
        #                 print(part_num)
        #                 total = total + part_num
        #     start_digit = -1
        #     end_digit = -1

print(total)
