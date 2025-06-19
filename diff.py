import matplotlib.pyplot as plt
import numpy as np
import random
import os
from pathlib import Path

def generate_random_path(grid):
    """Generate a single randomized backtracking path through the LCS grid"""
    i, j = grid.shape[0]-1, grid.shape[1]-1
    path = [(i, j)]  # Store path coordinates
    
    while i >= 1 or j >= 1:
        left = grid[i][j] == grid[i][j-1] and j-1 >= 0 
        up = grid[i][j] == grid[i-1][j] and i-1 >= 0

        if i==0 and j == 0:
            break
        
        if left and not up:
            j -= 1
        elif up and not left:
            i -= 1
        elif up and left:
            # RANDOMIZE: when both up and left are available, randomly choose
            if random.choice([True, False]):
                i -= 1  # go up
            else:
                j -= 1  # go left
        elif not up and not left:
            i -= 1
            j -= 1
        
        path.append((i, j))
    
    return path

def extract_lcs_from_path(path, word1_with_epsilon, word2_with_epsilon):
    """Extract the LCS string from a backtracking path"""
    lcs = []
    
    # Go through the path and find diagonal moves (which indicate matching characters)
    for k in range(len(path) - 1):
        curr_i, curr_j = path[k]
        next_i, next_j = path[k + 1]
        
        # Diagonal move means we found a matching character
        if curr_i - next_i == 1 and curr_j - next_j == 1:
            # The character is at the current position in either string
            lcs.append(word1_with_epsilon[curr_i])
    
    # Reverse because we built it backwards
    return ''.join(reversed(lcs))

def graph(word1="abcdefgh", word2="defabhcda", num_paths=5, save_to_downloads=False):
    # Add epsilon prefix like in backtrack function
    word1_with_epsilon = "ε" + word1
    word2_with_epsilon = "ε" + word2
    
    # Get grid dimensions
    rows = len(word1_with_epsilon)  # i dimension
    cols = len(word2_with_epsilon)  # j dimension
    
    # Create the DP grid
    grid = create_grid(word1_with_epsilon, word2_with_epsilon)
    
    fig, ax = plt.subplots(figsize=(max(8, cols), max(6, rows)))

    # Draw vertical lines
    for x in range(cols + 1):
        ax.plot([x, x], [0, rows], color='black', linewidth=0.5)

    # Draw horizontal lines
    for y in range(rows + 1):
        ax.plot([0, cols], [y, y], color='black', linewidth=0.5)

    # Add character labels on x-axis (word2)
    for j, char in enumerate(word2_with_epsilon):
        ax.text(j + 0.5, -0.3, char, ha='center', va='center', fontsize=12, fontweight='bold')
    
    # Add character labels on y-axis (word1) - need to reverse order for proper display
    for i, char in enumerate(word1_with_epsilon):
        ax.text(-0.3, rows - i - 0.5, char, ha='center', va='center', fontsize=12, fontweight='bold')
    
    # Fill in the grid values
    for i in range(rows):
        for j in range(cols):
            if i < grid.shape[0] and j < grid.shape[1]:
                # Display grid values, flip y-coordinate for proper display
                ax.text(j + 0.5, rows - i - 0.5, str(int(grid[i, j])), 
                       ha='center', va='center', fontsize=10)
    
    # Generate multiple randomized paths with different colors
    colors = ['red', 'blue', 'green', 'purple', 'orange', 'brown', 'pink', 'gray', 'olive', 'cyan']
    
    # Store LCS for display (all paths should give the same LCS)
    lcs_result = None
    
    for path_num in range(num_paths):
        # Generate a randomized path
        path = generate_random_path(grid)
        
        # Extract LCS from the first path (all should be the same)
        if path_num == 0:
            lcs_result = extract_lcs_from_path(path, word1_with_epsilon, word2_with_epsilon)
        
        # Choose color for this path
        color = colors[path_num % len(colors)]
        
        # Draw arrows for this path
        for k in range(len(path) - 1):
            curr_i, curr_j = path[k]
            next_i, next_j = path[k + 1]
            
            # Convert to display coordinates (flip y)
            start_x = curr_j + 0.5
            start_y = rows - curr_i - 0.5
            end_x = next_j + 0.5
            end_y = rows - next_i - 0.5
            
            # Draw arrow with unique color
            ax.annotate('', xy=(end_x, end_y), xytext=(start_x, start_y),
                       arrowprops=dict(arrowstyle='->', color=color, lw=2, alpha=0.7))

    ax.set_xlim(0, cols)
    ax.set_ylim(0, rows)
    ax.set_aspect('equal')
    
    # Display the LCS result prominently
    lcs_length = len(lcs_result) if lcs_result else 0
    ax.set_title(f'LCS Grid with {num_paths} Random Paths: "{word1}" vs "{word2}"\nLCS: "{lcs_result}" (Length: {lcs_length})', 
                 fontsize=14, fontweight='bold')
    
    # Add LCS display box in the graph
    if lcs_result:
        # Create a text box with the LCS
        textstr = f'LCS: "{lcs_result}"\nLength: {lcs_length}'
        props = dict(boxstyle='round', facecolor='wheat', alpha=0.8)
        ax.text(0.02, 0.98, textstr, transform=ax.transAxes, fontsize=12,
                verticalalignment='top', bbox=props, fontweight='bold')
    
    # Add legend for paths
    legend_elements = [plt.Line2D([0], [0], color=colors[i % len(colors)], lw=2, 
                                 label=f'Path {i+1}') for i in range(num_paths)]
    
    # Remove default ticks
    ax.set_xticks([])
    ax.set_yticks([])
    
    plt.tight_layout()
    
    # Save to downloads folder if requested
    if save_to_downloads:
        try:
            # Get the downloads folder path
            home = Path.home()
            downloads_folder = home / "Downloads"
            
            # Create filename with timestamp to avoid conflicts
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"lcs_graph_{word1}_{word2}_{num_paths}paths_{timestamp}.png"
            filepath = downloads_folder / filename
            
            # Save the figure
            plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
            print(f"✅ Graph saved to: {filepath}")
            
        except Exception as e:
            print(f"❌ Error saving graph: {e}")
    
    plt.show()


"""
in a [i,j] plot, the following rules apply. Note that value at [i, j] is v[i][j]:

1. if v[i][j] == v[i-1][j] and v[i][j] > v[i][j-1], i = i-1
2. if v[i][j] == v[i][j-1] and v[i][j] > v[i-1][j], j = j-1
3. if v[i][j] > v[i][j-1] and  v[i][j] > v[i-1][j], i = i-1, j = j-1
4. if v[i][j] == v[i][j-1] and  v[i][j] == v[i-1][j], either i = i-1, j = j or i = i and j = j -1

"""

def create_grid(word1 = "today", word2 = "trade"):

    i, j = len(word1), len(word2)

    grid = np.zeros((i, j))

    for i_ in range(1,i):
        for j_ in range(1, j):
            if word1[i_] == word2[j_]:
                grid[i_, j_] = grid[i_-1, j_-1] + 1
            elif i_ != 0 and j_ !=  0:
                grid[i_, j_] = max(grid[i_-1, j_], grid[i_, j_-1])
    print(grid)
    return grid


def backtrack(word1, word2):

    word1 = "ε"+word1
    word2 = "ε"+word2

    array = create_grid(word1, word2)

    i, j = array.shape[0]-1, array.shape[1]-1

    chain = []

    print(f"Starting conditions: \narray[{i}][{j}]: {array[i][j]}")
    while i >= 1 or j >= 1:

        left = array[i][j] == array[i][j-1] and j-1 >= 0 
        up = array[i][j] == array[i-1][j] and i-1 >= 0

        if i==0 and j == 0:
            print("loop complete")
            break
        if left and not up:
            j -= 1
            print(f"array[{i}][{j}]: {array[i][j]}")
        if up and not left:
            i -= 1
            print(f"array[{i}][{j}]: {array[i][j]}")
        if up and left:
            i -= 1 #up by default
            print(f"[up and left available] array[{i}][{j}]: {array[i][j]}")
        if not up and not left:
            chain.append(word1[i] or word2[j])
            i -= 1
            j -= 1
            print(f"array[{i}][{j}]: {array[i][j]}")

    return chain

if __name__ == "__main__":
    word1 = input("Enter source word: ")
    word2 = input("Enter derivative word: ")
    
    # Ask user for number of paths to generate
    try:
        num_paths_input = input("Enter number of paths to generate (default 5): ").strip()
        num_paths = int(num_paths_input) if num_paths_input else 5
        num_paths = max(1, min(num_paths, 10))  # Limit between 1 and 10 paths
    except ValueError:
        num_paths = 5
        print("Invalid input, using default of 5 paths")
    
    # Ask user if they want to save the graph
    save_input = input("Save graph to Downloads folder? (y/n, default n): ").strip().lower()
    save_to_downloads = save_input in ['y', 'yes', '1', 'true']

    graph(word1, word2, num_paths, save_to_downloads)