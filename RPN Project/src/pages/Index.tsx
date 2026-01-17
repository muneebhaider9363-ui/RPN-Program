import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ErrorNotification } from "@/components/ErrorNotification";
import { ResultCard } from "@/components/ResultCard";
import { processExpression, ProcessResponse } from "@/lib/api";
import { ArrowLeft, ArrowRight, Calculator, RefreshCw } from "lucide-react";

type Screen = "welcome" | "conversion" | "conversion-type" | "evaluation";
type ConversionType = "infix" | "prefix" | "postfix";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [conversionType, setConversionType] = useState<ConversionType>("infix");
  const [expression, setExpression] = useState("");
  const [evaluationType, setEvaluationType] = useState<ConversionType>("infix");
  const [result, setResult] = useState<ProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEvalPrompt, setShowEvalPrompt] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const resetState = () => {
    setExpression("");
    setResult(null);
    setError(null);
    setShowEvalPrompt(false);
    setShowAnswer(false);
    setLoading(false);
  };

  const goToWelcome = () => {
    resetState();
    setScreen("welcome");
  };

  const getInputFormat = (type: ConversionType): "1" | "2" | "3" => {
    switch (type) {
      case "infix": return "1";
      case "prefix": return "2";
      case "postfix": return "3";
    }
  };

  const handleConvert = async () => {
    if (!expression.trim()) {
      setError("Please enter an expression");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowEvalPrompt(false);
    setShowAnswer(false);

    try {
      const response = await processExpression({
        expression: expression.trim(),
        input_format: getInputFormat(conversionType),
      });

      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
        setShowEvalPrompt(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!expression.trim()) {
      setError("Please enter an expression");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await processExpression({
        expression: expression.trim(),
        input_format: getInputFormat(evaluationType),
      });

      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShowEvalPrompt(false);
  };

  const getConversionLabel = (type: ConversionType): string => {
    switch (type) {
      case "infix": return "Infix to Postfix/Prefix";
      case "prefix": return "Prefix to Infix/Postfix";
      case "postfix": return "Postfix to Infix/Prefix";
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {error && (
        <ErrorNotification message={error} onClose={() => setError(null)} />
      )}

      <div className="w-full max-w-xl">
        {/* Welcome Screen */}
        {screen === "welcome" && (
          <div className="animate-fade-in text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              Reverse Polish Notation
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Program
            </p>

            <div className="flex flex-col gap-4">
              <Button
                variant="action"
                size="xl"
                onClick={() => setScreen("conversion")}
                className="w-full justify-between group"
              >
                <span className="flex items-center gap-3">
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-base" />
                  Conversion
                </span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-base" />
              </Button>

              <Button
                variant="action"
                size="xl"
                onClick={() => {
                  resetState();
                  setScreen("evaluation");
                }}
                className="w-full justify-between group"
              >
                <span className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-base" />
                  Evaluation
                </span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-base" />
              </Button>

              <Button
                variant="action"
                size="xl"
                onClick={goToWelcome}
                className="w-full justify-between group"
              >
                <span className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-base" />
                  Exit
                </span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-base" />
              </Button>
            </div>
          </div>
        )}

        {/* Conversion Type Selection */}
        {screen === "conversion" && (
          <div className="animate-fade-in">
            <Button
              variant="back"
              size="sm"
              onClick={goToWelcome}
              className="mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main Menu
            </Button>

            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Select Conversion Type
            </h2>

            <div className="flex flex-col gap-3">
              {(["infix", "prefix", "postfix"] as ConversionType[]).map((type) => (
                <Button
                  key={type}
                  variant="action"
                  size="lg"
                  onClick={() => {
                    resetState();
                    setConversionType(type);
                    setScreen("conversion-type");
                  }}
                  className="w-full justify-between group"
                >
                  <span>{getConversionLabel(type)}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-base" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Conversion Input & Results */}
        {screen === "conversion-type" && (
          <div className="animate-fade-in">
            <Button
              variant="back"
              size="sm"
              onClick={() => {
                resetState();
                setScreen("conversion");
              }}
              className="mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {getConversionLabel(conversionType)}
            </h2>
            <p className="text-muted-foreground mb-6">
              Enter your expression below
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="expression" className="text-sm font-medium text-foreground">
                  Enter Expression (use spaces)
                </Label>
                <Input
                  id="expression"
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g., ( A + B ) * C"
                  className="mt-2 h-12 text-base font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleConvert()}
                />
              </div>

              <Button
                onClick={handleConvert}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? "Converting..." : "Convert"}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-8 space-y-3">
                {result.infix && conversionType !== "infix" && (
                  <ResultCard label="Infix" value={result.infix} />
                )}
                {result.prefix && conversionType !== "prefix" && (
                  <ResultCard label="Prefix" value={result.prefix} />
                )}
                {result.postfix && conversionType !== "postfix" && (
                  <ResultCard label="Postfix" value={result.postfix} />
                )}

                {/* Eval Prompt */}
                {showEvalPrompt && (
                  <div className="mt-6 p-4 rounded-xl border border-border bg-card shadow-subtle animate-fade-in">
                    <p className="text-sm text-foreground mb-4">
                      Do you also want to evaluate this expression?
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={handleShowAnswer} variant="default" size="sm">
                        Yes
                      </Button>
                      <Button onClick={() => setShowEvalPrompt(false)} variant="outline" size="sm">
                        No
                      </Button>
                    </div>
                  </div>
                )}

                {/* Answer */}
                {showAnswer && result.answer !== undefined && (
                  <ResultCard
                    label="Answer"
                    value={result.answer.toString()}
                    variant="highlight"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Evaluation Screen */}
        {screen === "evaluation" && (
          <div className="animate-fade-in">
            <Button
              variant="back"
              size="sm"
              onClick={goToWelcome}
              className="mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main Menu
            </Button>

            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Evaluate Expression
            </h2>
            <p className="text-muted-foreground mb-6">
              Enter an expression and select its format
            </p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="eval-expression" className="text-sm font-medium text-foreground">
                  Enter Expression (use spaces)
                </Label>
                <Input
                  id="eval-expression"
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g., 3 4 + 2 *"
                  className="mt-2 h-12 text-base font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleEvaluate()}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">
                  Input Type
                </Label>
                <RadioGroup
                  value={evaluationType}
                  onValueChange={(v) => setEvaluationType(v as ConversionType)}
                  className="flex gap-6"
                >
                  {(["infix", "prefix", "postfix"] as ConversionType[]).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`eval-${type}`} />
                      <Label
                        htmlFor={`eval-${type}`}
                        className="text-sm font-normal cursor-pointer capitalize"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={handleEvaluate}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? "Evaluating..." : "Evaluate"}
              </Button>
            </div>

            {/* Result */}
            {result && result.answer !== undefined && (
              <div className="mt-8">
                <ResultCard
                  label="Answer"
                  value={result.answer.toString()}
                  variant="highlight"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          RPN Calculator • Use spaces between operands and operators
        </p>
      </footer>
    </main>
  );
};

export default Index;
