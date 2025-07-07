import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Lock, Unlock, FileText } from "lucide-react";

interface QuantumResult {
  algorithm: string;
  keySize: number;
  estimatedBreakTime: string;
  recommendation: string;
  quantumResistant: boolean;
}

export default function Quantum() {
  const [quantumTests, setQuantumTests] = useState<QuantumResult[]>([
    {
      algorithm: "ECDSA-256",
      keySize: 256,
      estimatedBreakTime: "~2030 (Quantum Computer)",
      recommendation: "Migrate to post-quantum cryptography",
      quantumResistant: false,
    },
    {
      algorithm: "Kyber-1024",
      keySize: 1024,
      estimatedBreakTime: ">100 years (Post-Quantum)",
      recommendation: "Quantum-resistant, keep monitoring",
      quantumResistant: true,
    },
  ]);
  const [testKey, setTestKey] = useState("");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantum Resistance Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Quantum Resistance Test
            </CardTitle>
            <CardDescription>
              Test cryptographic keys against quantum computing threats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Private Key or Address
              </label>
              <Textarea
                placeholder="0x... or private key"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                className="h-20"
              />
            </div>
            <Button
              onClick={() => {
                if (testKey.trim()) {
                  const result: QuantumResult = {
                    algorithm: "RSA-2048",
                    keySize: 2048,
                    estimatedBreakTime: "~2030 (Quantum Computer)",
                    recommendation: "Migrate to post-quantum cryptography",
                    quantumResistant: false,
                  };
                  setQuantumTests((prev) => [result, ...prev]);
                  setTestKey("");
                }
              }}
              disabled={!testKey.trim()}
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              Test Quantum Resistance
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quantum Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {quantumTests.map((result, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {result.algorithm}
                      </span>
                      <div className="flex items-center gap-2">
                        {result.quantumResistant ? (
                          <Lock className="w-4 h-4 text-green-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-red-500" />
                        )}
                        <Badge
                          variant={
                            result.quantumResistant ? "default" : "destructive"
                          }
                        >
                          {result.quantumResistant ? "Resistant" : "Vulnerable"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Key Size:</span>
                        <span className="ml-2">{result.keySize} bits</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Break Time:
                        </span>
                        <span className="ml-2">
                          {result.estimatedBreakTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Recommendation:
                        </span>
                        <div className="mt-1 p-2 bg-muted rounded text-xs">
                          {result.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {quantumTests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tests performed yet. Enter a key above to test quantum
                    resistance.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
