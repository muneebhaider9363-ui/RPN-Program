from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import math

# --- THE MATH ENGINE (Original Logic) ---
class ExpressionEngine:
    def _get_operator_precedence(self, operation):
        if operation == '^': return 3
        if operation in "* / %": return 2
        if operation in "+ -": return 1
        return 0

    def _is_right_associative(self, operation):
        return operation == '^'

    def _check_is_operator(self, text):
        return len(text) == 1 and text in "+-*/%^"

    def _check_is_number(self, text):
        if not text or text == "-": return False
        try:
            float(text)
            return True
        except ValueError:
            return False

    def tokenize_input(self, user_input):
        cleaned = ""
        for char in user_input:
            if char in "[{": cleaned += "("
            elif char in "]}": cleaned += ")"
            else: cleaned += char
        return cleaned.split()

    def are_brackets_balanced(self, token_list):
        balance = 0
        for token in token_list:
            if token == "(": balance += 1
            elif token == ")": balance -= 1
            if balance < 0: return False
        return balance == 0

    def is_postfix_syntactically_valid(self, tokens):
        if not tokens: return False
        count = 0
        for t in tokens:
            if self._check_is_number(t): count += 1
            elif self._check_is_operator(t):
                if count < 2: return False
                count -= 1
            else: return False
        return count == 1

    def convert_infix_to_postfix(self, tokens):
        if not self.are_brackets_balanced(tokens): return ["ERROR_MISMATCHED_PARENTHESES"]
        output, stack = [], []
        for t in tokens:
            if self._check_is_number(t): output.append(t)
            elif t == "(": stack.append(t)
            elif t == ")":
                while stack and stack[-1] != "(": output.append(stack.pop())
                if not stack: return ["ERROR_MISMATCHED_PARENTHESES"]
                stack.pop()
            elif self._check_is_operator(t):
                while stack and stack[-1] != "(":
                    curr_p, top_p = self._get_operator_precedence(t), self._get_operator_precedence(stack[-1])
                    if (not self._is_right_associative(t) and curr_p <= top_p) or (self._is_right_associative(t) and curr_p < top_p):
                        output.append(stack.pop())
                    else: break
                stack.append(t)
            else: return ["ERROR_INVALID_TOKEN"]
        while stack:
            if stack[-1] == "(": return ["ERROR_MISMATCHED_PARENTHESES"]
            output.append(stack.pop())
        return output

    def convert_infix_to_prefix(self, tokens):
        rev = tokens[::-1]
        swapped = [("(" if t == ")" else ")" if t == "(" else t) for t in rev]
        res = self.convert_infix_to_postfix(swapped)
        if res and "ERROR" in res[0]: return res
        return res[::-1]

    def convert_postfix_to_infix(self, tokens):
        stack = []
        for t in tokens:
            if self._check_is_number(t): stack.append(t)
            else:
                b, a = stack.pop(), stack.pop()
                stack.append(f"( {a} {t} {b} )")
        return stack[0]

    def convert_postfix_to_prefix(self, tokens):
        stack = []
        for t in tokens:
            if self._check_is_number(t): stack.append([t])
            else:
                b, a = stack.pop(), stack.pop()
                stack.append([t] + a + b)
        return stack[0]

    def convert_prefix_to_postfix(self, tokens):
        stack = []
        for i in range(len(tokens)-1, -1, -1):
            t = tokens[i]
            if self._check_is_number(t): stack.append([t])
            elif self._check_is_operator(t):
                if len(stack) < 2: return ["ERROR_INVALID_SYNTAX"]
                a, b = stack.pop(), stack.pop()
                stack.append(a + b + [t])
            else: return ["ERROR_INVALID_TOKEN"]
        return stack[0]

    def convert_prefix_to_infix(self, tokens):
        post = self.convert_prefix_to_postfix(tokens)
        return self.convert_postfix_to_infix(post)

    def evaluate_postfix_expression(self, tokens):
        if not self.is_postfix_syntactically_valid(tokens): return "Error: Invalid Syntax"
        stack = []
        for t in tokens:
            if self._check_is_number(t): stack.append(float(t))
            else:
                b, a = stack.pop(), stack.pop()
                if t == "+": stack.append(a + b)
                elif t == "-": stack.append(a - b)
                elif t == "*": stack.append(a * b)
                elif t == "/":
                    if b == 0: return "Undefined"
                    stack.append(a / b)
                elif t == "^": stack.append(math.pow(a, b))
                elif t == "%": stack.append(math.fmod(a, b))
        return f"{stack[0]:g}"

# --- API INTEGRATION ---
app = FastAPI()

# Allows Lovable (Frontend) to talk to this script
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ExpressionEngine()

class MathRequest(BaseModel):
    expression: str
    input_format: str 

@app.post("/process")
def process_math(req: MathRequest):
    tokens = engine.tokenize_input(req.expression)
    try:
        if req.input_format == "1": # Infix
            postfix = engine.convert_infix_to_postfix(tokens)
            prefix = engine.convert_infix_to_prefix(tokens)
            infix_out = req.expression
        elif req.input_format == "2": # Prefix
            postfix = engine.convert_prefix_to_postfix(tokens)
            infix_out = engine.convert_prefix_to_infix(tokens)
            prefix = tokens
        else: # Postfix
            postfix = tokens
            infix_out = engine.convert_postfix_to_infix(tokens)
            prefix = engine.convert_postfix_to_prefix(tokens)

        # Validation
        if postfix and isinstance(postfix[0], str) and "ERROR" in postfix[0]:
            raise HTTPException(status_code=400, detail=postfix[0])

        answer = engine.evaluate_postfix_expression(postfix)
        
        return {
            "infix": infix_out,
            "postfix": " ".join(postfix) if isinstance(postfix, list) else postfix,
            "prefix": " ".join(prefix) if isinstance(prefix, list) else prefix,
            "answer": str(answer)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)