import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Beaker, Leaf, Droplet, Fish, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const KnowledgeBase = () => {
    return (
        <div className="space-y-6">
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-6 w-6 text-primary" />
                        Educational Resources
                    </CardTitle>
                    <CardDescription>
                        Learn about ammonia testing and natural indicators
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="ammonia" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ammonia">Ammonia Guide</TabsTrigger>
                            <TabsTrigger value="butterfly-pea">Butterfly Pea</TabsTrigger>
                        </TabsList>

                        {/* Ammonia Tab */}
                        <TabsContent value="ammonia" className="space-y-4">
                            <Alert>
                                <Droplet className="h-4 w-4" />
                                <AlertTitle>What is Ammonia?</AlertTitle>
                                <AlertDescription>
                                    Ammonia (NH₃) is a toxic compound that naturally occurs in aquariums as fish waste,
                                    uneaten food, and decaying organic matter break down.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <Fish className="h-5 w-5 text-primary" />
                                        Why is Ammonia Dangerous?
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                        <li><strong>Toxic to Fish:</strong> Even low levels (0.25-0.5 ppm) can cause stress</li>
                                        <li><strong>Burns Gills:</strong> Damages fish respiratory system</li>
                                        <li><strong>Weakens Immunity:</strong> Makes fish susceptible to disease</li>
                                        <li><strong>Can Be Fatal:</strong> High levels (&gt;1.0 ppm) can kill fish quickly</li>
                                    </ul>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Ammonia Levels Guide</h3>
                                    <div className="space-y-3">
                                        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                            <p className="font-semibold text-success">Safe (0-0.25 ppm)</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Ideal range. Continue regular maintenance and monitoring.
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                                            <p className="font-semibold text-warning">Elevated (0.25-0.5 ppm)</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Increase water changes. Check filter and reduce feeding.
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                                            <p className="font-semibold text-warning">High (0.5-1.0 ppm)</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Immediate 50% water change needed. Stop feeding temporarily.
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                            <p className="font-semibold text-destructive">Critical (&gt;1.0 ppm)</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Emergency! 75-90% water change. Add ammonia neutralizer immediately.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Prevention Tips</h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                        <li>Don't overstock your aquarium</li>
                                        <li>Don't overfeed - remove uneaten food after 5 minutes</li>
                                        <li>Perform regular water changes (20-30% weekly)</li>
                                        <li>Maintain good filtration with beneficial bacteria</li>
                                        <li>Test ammonia levels weekly, or daily in new tanks</li>
                                        <li>Cycle new tanks before adding fish (4-6 weeks)</li>
                                    </ul>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">The Nitrogen Cycle</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        In a healthy aquarium, beneficial bacteria convert ammonia through this process:
                                    </p>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-mono text-center">
                                            Ammonia (NH₃) → Nitrite (NO₂⁻) → Nitrate (NO₃⁻)
                                        </p>
                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            Beneficial bacteria make your aquarium safe over time
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Butterfly Pea Tab */}
                        <TabsContent value="butterfly-pea" className="space-y-4">
                            <Alert>
                                <Leaf className="h-4 w-4" />
                                <AlertTitle>What is Butterfly Pea?</AlertTitle>
                                <AlertDescription>
                                    Butterfly pea (Clitoria ternatea) is a tropical flowering plant whose flowers
                                    contain natural anthocyanins that change color based on pH levels.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <Beaker className="h-5 w-5 text-primary" />
                                        Natural pH Indicator Properties
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Butterfly pea flower extract is a natural pH indicator that changes color dramatically:
                                    </p>
                                    <div className="space-y-2">
                                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgb(59, 130, 246, 0.1)' }}>
                                            <p className="font-semibold" style={{ color: 'rgb(59, 130, 246)' }}>Blue (pH 7-8)</p>
                                            <p className="text-sm text-muted-foreground">Neutral to slightly alkaline</p>
                                        </div>
                                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgb(139, 92, 246, 0.1)' }}>
                                            <p className="font-semibold" style={{ color: 'rgb(139, 92, 246)' }}>Purple (pH 6-7)</p>
                                            <p className="text-sm text-muted-foreground">Slightly acidic to neutral</p>
                                        </div>
                                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgb(236, 72, 153, 0.1)' }}>
                                            <p className="font-semibold" style={{ color: 'rgb(236, 72, 153)' }}>Pink (pH 4-6)</p>
                                            <p className="text-sm text-muted-foreground">Acidic</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Ammonia Detection Connection</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Butterfly pea extract can be used as a preliminary ammonia indicator because:
                                    </p>
                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                        <li>Ammonia in water increases pH (makes it more alkaline)</li>
                                        <li>The extract shifts from pink/purple to blue as pH rises</li>
                                        <li>A blue shift may indicate presence of ammonia</li>
                                        <li>This is a qualitative, not quantitative test</li>
                                        <li>Should be confirmed with proper ammonia test kits</li>
                                    </ul>
                                    <Alert className="mt-3">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                            <strong>Note:</strong> While butterfly pea is a fun natural indicator,
                                            always use proper test strips or kits for accurate ammonia measurement in aquariums.
                                        </AlertDescription>
                                    </Alert>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Other Uses of Butterfly Pea</h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                                        <li><strong>Beverage Coloring:</strong> Blue tea, lemonade, cocktails</li>
                                        <li><strong>Food Coloring:</strong> Rice, desserts, and baked goods</li>
                                        <li><strong>Traditional Medicine:</strong> Antioxidant and anti-inflammatory properties</li>
                                        <li><strong>Science Education:</strong> Demonstrates pH and acid-base chemistry</li>
                                        <li><strong>Natural Dye:</strong> Fabric and textile coloring</li>
                                    </ul>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">How to Use as pH Indicator</h3>
                                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                                        <li>Steep dried butterfly pea flowers in hot water (like tea)</li>
                                        <li>Let cool and strain to get blue extract</li>
                                        <li>Add a few drops to the liquid you want to test</li>
                                        <li>Observe color change:
                                            <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                                                <li>Stays blue = neutral/alkaline</li>
                                                <li>Turns purple = slightly acidic</li>
                                                <li>Turns pink = acidic</li>
                                            </ul>
                                        </li>
                                        <li>Compare with pH reference chart</li>
                                    </ol>
                                </div>

                                <Alert className="bg-primary/5 border-primary/20">
                                    <Leaf className="h-4 w-4 text-primary" />
                                    <AlertTitle className="text-primary">Educational Value</AlertTitle>
                                    <AlertDescription>
                                        Butterfly pea is an excellent teaching tool for understanding pH, acid-base reactions,
                                        and natural chemistry. It's safe, non-toxic, and visually striking!
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};
