import re

with open('scripts/generate_report.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace 'return """' with 'return r"""'
text = re.sub(r'return """', 'return r"""', text)

with open('scripts/generate_report.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed raw strings in scripts/generate_report.py")
