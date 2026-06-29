import matplotlib.pyplot as plt
import numpy as np
import os

# Create an output directory for graphs
output_dir = "test_reports"
os.makedirs(output_dir, exist_ok=True)

# 1. Generate "Test Results PASS/FAIL" Pie Chart
labels = 'Pass', 'Fail'
sizes = [85, 15]
colors = ['#4CAF50', '#F44336']
explode = (0.1, 0)  

fig1, ax1 = plt.subplots()
ax1.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%',
        shadow=True, startangle=90)
ax1.axis('equal')  
plt.title("Overall Integration Test Results")
plt.savefig(f"{output_dir}/test_pass_fail_pie.png")
plt.close()

# 2. Generate "Expected vs Actual Execution Time" Scatter Plot with PASS/FAIL Classification
# Mock data representing different test cases
test_cases = [30, 35, 40, 45, 50]
expected_time = np.array([30, 36, 40, 45, 52])
actual_time = np.array([28, 36, 41, 45, 65]) # The last one fails because it's too slow

fig2, ax2 = plt.subplots(figsize=(8, 5))

# Plot the ideal line y = x
ax2.plot([28, 55], [28, 55], color='blue', label='Ideal (y=x)')

# Separate pass and fail points
pass_x, pass_y = [], []
fail_x, fail_y = [], []

for exp, act in zip(expected_time, actual_time):
    if abs(exp - act) > 10:
        fail_x.append(exp)
        fail_y.append(act)
    else:
        pass_x.append(exp)
        pass_y.append(act)

ax2.scatter(pass_x, pass_y, color='green', s=60, label='PASS', zorder=5)
ax2.scatter(fail_x, fail_y, color='red', s=60, label='FAIL', zorder=5)

ax2.set_xlabel('Expected Execution Time (ms)')
ax2.set_ylabel('Actual Execution Time (ms)')
ax2.set_title('Expected vs Actual Execution Time with PASS/FAIL Classification')
ax2.legend()
plt.grid(True, linestyle='--', alpha=0.6)

plt.savefig(f"{output_dir}/execution_time_scatter.png")
plt.close()

print(f"Graphs successfully generated in the '{output_dir}' directory.")
