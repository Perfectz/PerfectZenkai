import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';
import { DailyStandup, ReflectionEntry, PriorityCompletion, GoalProgress, EnergyEvent } from '../types/reflection.types';
import { useDailyJournalStore } from '../stores/dailyJournalStore';

interface ReflectionFormProps {
  standup: DailyStandup;
  onSubmit: (data: ReflectionEntry) => void;
  onCancel: () => void;
  aiInsights?: string[];
  availableGoals?: { id: string; title: string }[];
}

const reflectionFormSchema = z.object({
  priorities: z.array(z.object({
    id: z.string(),
    status: z.enum(['completed', 'partial', 'skipped']),
  })).min(1, "At least one priority status must be selected"),
  endEnergyLevel: z.number().min(1, "Energy level is required").max(10, "Energy level must be between 1 and 10"),
  endMood: z.string().min(1, "Mood is required"),
  satisfactionScore: z.number().min(1, "Satisfaction score is required").max(10, "Satisfaction score must be between 1 and 10"),
  dayHighlights: z.array(z.string()).optional(),
  lessonsLearned: z.string().optional(),
  unexpectedTasks: z.string().optional(),
  goalProgress: z.array(z.object({
    goalId: z.string().min(1, "Goal is required"),
    progressMade: z.string().min(1, "Progress description is required"),
    percentage: z.number().min(0).max(100),
  })).optional(),
  energyPeaks: z.array(z.object({
    time: z.string().min(1, "Time is required"),
    description: z.string().optional(),
  })).optional(),
  energyDips: z.array(z.object({
    time: z.string().min(1, "Time is required"),
    description: z.string().optional(),
  })).optional(),
  tomorrowPriorities: z.string().optional(),
  tomorrowConcerns: z.string().optional(),
  tomorrowOpportunities: z.string().optional(),
});

type ReflectionFormValues = z.infer<typeof reflectionFormSchema>;

export const ReflectionForm: React.FC<ReflectionFormProps> = ({
  standup,
  onSubmit,
  onCancel,
  aiInsights = [],
  availableGoals = [],
}) => {
  const { createReflection, isLoading, error, saveDraft } = useDailyJournalStore();

  const defaultValues: ReflectionFormValues = {
    priorities: standup.todayPriorities.map(p => ({ id: p.id, status: 'skipped' })),
    endEnergyLevel: standup.todayEnergyLevel || 5,
    endMood: standup.todayMood || '',
    satisfactionScore: 5,
    dayHighlights: [],
    lessonsLearned: '',
    unexpectedTasks: '',
    goalProgress: [],
    energyPeaks: [],
    energyDips: [],
    tomorrowPriorities: '',
    tomorrowConcerns: '',
    tomorrowOpportunities: '',
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ReflectionFormValues>({
    resolver: zodResolver(reflectionFormSchema),
    defaultValues,
  });

  const watchedPriorities = watch('priorities');
  const watchedEndEnergyLevel = watch('endEnergyLevel');
  const watchedEndMood = watch('endMood');
  const watchedSatisfactionScore = watch('satisfactionScore');
  const watchedDayHighlights = watch('dayHighlights');
  const watchedLessonsLearned = watch('lessonsLearned');
  const watchedUnexpectedTasks = watch('unexpectedTasks');
  const watchedGoalProgress = watch('goalProgress');
  const watchedEnergyPeaks = watch('energyPeaks');
  const watchedEnergyDips = watch('energyDips');
  const watchedTomorrowPriorities = watch('tomorrowPriorities');
  const watchedTomorrowConcerns = watch('tomorrowConcerns');
  const watchedTomorrowOpportunities = watch('tomorrowOpportunities');

  // Auto-save draft
  useEffect(() => {
    const handler = setTimeout(() => {
      saveDraft({
        standupId: standup.id,
        date: standup.date,
        prioritiesCompleted: watchedPriorities.filter(p => p.status === 'completed').map(p => p.id),
        prioritiesPartial: watchedPriorities.filter(p => p.status === 'partial').map(p => p.id),
        prioritiesSkipped: watchedPriorities.filter(p => p.status === 'skipped').map(p => p.id),
        endEnergyLevel: watchedEndEnergyLevel,
        endMood: watchedEndMood,
        satisfactionScore: watchedSatisfactionScore,
        dayHighlights: watchedDayHighlights,
        lessonsLearned: watchedLessonsLearned,
        unexpectedTasks: watchedUnexpectedTasks,
        goalProgress: watchedGoalProgress,
        energyPeaks: watchedEnergyPeaks,
        energyDips: watchedEnergyDips,
        tomorrowPriorities: watchedTomorrowPriorities,
        tomorrowConcerns: watchedTomorrowConcerns,
        tomorrowOpportunities: watchedTomorrowOpportunities,
      });
    }, 1000); // Save 1 second after user stops typing/changing

    return () => {
      clearTimeout(handler);
    };
  }, [
    watchedPriorities,
    watchedEndEnergyLevel,
    watchedEndMood,
    watchedSatisfactionScore,
    watchedDayHighlights,
    watchedLessonsLearned,
    watchedUnexpectedTasks,
    watchedGoalProgress,
    watchedEnergyPeaks,
    watchedEnergyDips,
    watchedTomorrowPriorities,
    watchedTomorrowConcerns,
    watchedTomorrowOpportunities,
    standup.id,
    standup.date,
    saveDraft,
  ]);

  const handleAddHighlight = () => {
    setValue('dayHighlights', [...(watchedDayHighlights || []), '']);
  };

  const handleRemoveHighlight = (index: number) => {
    const newHighlights = [...(watchedDayHighlights || [])];
    newHighlights.splice(index, 1);
    setValue('dayHighlights', newHighlights);
  };

  const handleAddGoalProgress = () => {
    setValue('goalProgress', [...(watchedGoalProgress || []), { goalId: '', progressMade: '', percentage: 0 }]);
  };

  const handleRemoveGoalProgress = (index: number) => {
    const newProgress = [...(watchedGoalProgress || [])];
    newProgress.splice(index, 1);
    setValue('goalProgress', newProgress);
  };

  const handleAddEnergyPeak = () => {
    setValue('energyPeaks', [...(watchedEnergyPeaks || []), { time: '', description: '', type: 'peak' }]);
  };

  const handleRemoveEnergyPeak = (index: number) => {
    const newPeaks = [...(watchedEnergyPeaks || [])];
    newPeaks.splice(index, 1);
    setValue('energyPeaks', newPeaks);
  };

  const handleAddEnergyDip = () => {
    setValue('energyDips', [...(watchedEnergyDips || []), { time: '', description: '', type: 'dip' }]);
  };

  const handleRemoveEnergyDip = (index: number) => {
    const newDips = [...(watchedEnergyDips || [])];
    newDips.splice(index, 1);
    setValue('energyDips', newDips);
  };

  const calculateCompletionStats = () => {
    const completedCount = watchedPriorities.filter(p => p.status === 'completed').length;
    const totalPriorities = standup.todayPriorities.length;
    const completionRate = totalPriorities > 0 ? (completedCount / totalPriorities) * 100 : 0;
    return { completedCount, totalPriorities, completionRate };
  };

  const { completedCount, totalPriorities, completionRate } = calculateCompletionStats();

  const onSubmitHandler = async (data: ReflectionFormValues) => {
    const reflectionData: ReflectionEntry = {
      standupId: standup.id,
      date: standup.date,
      prioritiesCompleted: data.priorities.filter(p => p.status === 'completed').map(p => p.id),
      prioritiesPartial: data.priorities.filter(p => p.status === 'partial').map(p => p.id),
      prioritiesSkipped: data.priorities.filter(p => p.status === 'skipped').map(p => p.id),
      endEnergyLevel: data.endEnergyLevel,
      endMood: data.endMood,
      satisfactionScore: data.satisfactionScore,
      dayHighlights: data.dayHighlights,
      lessonsLearned: data.lessonsLearned,
      unexpectedTasks: data.unexpectedTasks,
      goalProgress: data.goalProgress,
      energyPeaks: data.energyPeaks?.map(peak => ({ ...peak, type: 'peak' })),
      energyDips: data.energyDips?.map(dip => ({ ...dip, type: 'dip' })),
      tomorrowPriorities: data.tomorrowPriorities,
      tomorrowConcerns: data.tomorrowConcerns,
      tomorrowOpportunities: data.tomorrowOpportunities,
    };
    await createReflection(reflectionData);
    onSubmit(reflectionData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-xl border border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ki-green">Daily Reflection</CardTitle>
        <p className="text-gray-400">Reflect on your day and plan for tomorrow.</p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button variant="link" onClick={() => { /* retry logic */ }}>Retry</Button>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-8" aria-live="polite">
          {/* Progress Assessment */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Progress Assessment</h2>
            <div className="space-y-4">
              {standup.todayPriorities.map((priority, index) => (
                <Card key={priority.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <Label className="text-gray-300 mb-2 block">
                      {priority.description} (Est: {priority.estimatedTime} min)
                    </Label>
                    <RadioGroup
                      onValueChange={(value) => {
                        const newPriorities = [...watchedPriorities];
                        newPriorities[index] = { id: priority.id, status: value as 'completed' | 'partial' | 'skipped' };
                        setValue('priorities', newPriorities);
                      }}
                      value={watchedPriorities[index]?.status || 'skipped'}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id={`priority-${priority.id}-completed`} />
                        <Label htmlFor={`priority-${priority.id}-completed`}>Completed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partial" id={`priority-${priority.id}-partial`} />
                        <Label htmlFor={`priority-${priority.id}-partial`}>Partial</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="skipped" id={`priority-${priority.id}-skipped`} />
                        <Label htmlFor={`priority-${priority.id}-skipped`}>Skipped</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
              <div className="mt-4 text-sm text-gray-400">
                <p>Completed: {completedCount} of {totalPriorities} priorities</p>
                <p>Completion Rate: {completionRate.toFixed(0)}%</p>
                <Progress value={completionRate} className="w-full mt-2" />
              </div>
            </div>
          </section>

          {/* Energy & Mood */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Energy & Mood</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="endEnergyLevel">End Energy Level (1-10)</Label>
                <Slider
                  id="endEnergyLevel"
                  min={1}
                  max={10}
                  step={1}
                  value={[watchedEndEnergyLevel]}
                  onValueChange={(value) => setValue('endEnergyLevel', value[0])}
                  className="mt-2"
                />
                <p className="text-sm text-gray-400">Current: {watchedEndEnergyLevel}</p>
                {errors.endEnergyLevel && <p className="text-red-500 text-sm mt-1">{errors.endEnergyLevel.message}</p>}
              </div>
              <div>
                <Label htmlFor="endMood">End Mood</Label>
                <Select
                  onValueChange={(value) => setValue('endMood', value)}
                  value={watchedEndMood}
                >
                  <SelectTrigger className="w-full mt-1 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select mood..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="focused">Focused</SelectItem>
                    <SelectItem value="satisfied">Satisfied</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="tired">Tired</SelectItem>
                    <SelectItem value="stressed">Stressed</SelectItem>
                    <SelectItem value="frustrated">Frustrated</SelectItem>
                  </SelectContent>
                </Select>
                {errors.endMood && <p className="text-red-500 text-sm mt-1">{errors.endMood.message}</p>}
              </div>
              <div>
                <Label htmlFor="satisfactionScore">Satisfaction Score (1-10)</Label>
                <Slider
                  id="satisfactionScore"
                  min={1}
                  max={10}
                  step={1}
                  value={[watchedSatisfactionScore]}
                  onValueChange={(value) => setValue('satisfactionScore', value[0])}
                  className="mt-2"
                />
                <p className="text-sm text-gray-400">Current: {watchedSatisfactionScore}</p>
                {errors.satisfactionScore && <p className="text-red-500 text-sm mt-1">{errors.satisfactionScore.message}</p>}
              </div>
            </div>
          </section>

          {/* Daily Reflection */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Daily Reflection</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dayHighlights">Day's Highlights</Label>
                {(watchedDayHighlights || []).map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <Input
                      {...register(`dayHighlights.${index}`)}
                      placeholder="What went well today?"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveHighlight(index)}
                      aria-label="remove highlight"
                    >
                      <MinusCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" className="mt-2 text-ki-green border-ki-green hover:bg-ki-green hover:text-black" onClick={handleAddHighlight} aria-label="add highlight">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Highlight
                </Button>
              </div>
              <div>
                <Label htmlFor="lessonsLearned">Lessons Learned</Label>
                <Textarea
                  {...register('lessonsLearned')}
                  placeholder="What did you learn today?"
                  rows={3}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="unexpectedTasks">Unexpected Tasks/Distractions</Label>
                <Textarea
                  {...register('unexpectedTasks')}
                  placeholder="What unexpected tasks or distractions came up?"
                  rows={2}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
            </div>
          </section>

          {/* Goal Progress */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Goal Progress</h2>
            <div className="space-y-4">
              {(watchedGoalProgress || []).map((progress, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div>
                      <Label htmlFor={`goalProgress.${index}.goalId`}>Select Goal</Label>
                      <Select
                        onValueChange={(value) => setValue(`goalProgress.${index}.goalId`, value)}
                        value={progress.goalId}
                      >
                        <SelectTrigger className="w-full mt-1 bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select a goal" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          {availableGoals.map(goal => (
                            <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.goalProgress?.[index]?.goalId && <p className="text-red-500 text-sm mt-1">{errors.goalProgress[index]?.goalId?.message}</p>}
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`goalProgress.${index}.progressMade`}>Progress Made</Label>
                      <Textarea
                        {...register(`goalProgress.${index}.progressMade`)}
                        placeholder="Describe progress made on this goal"
                        rows={2}
                        className="bg-gray-800 border-gray-600 text-white mt-1"
                      />
                      {errors.goalProgress?.[index]?.progressMade && <p className="text-red-500 text-sm mt-1">{errors.goalProgress[index]?.progressMade?.message}</p>}
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`goalProgress.${index}.percentage`}>Percent Complete</Label>
                      <Slider
                        id={`goalProgress.${index}.percentage`}
                        min={0}
                        max={100}
                        step={1}
                        value={[progress.percentage]}
                        onValueChange={(value) => setValue(`goalProgress.${index}.percentage`, value[0])}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-400">Current: {progress.percentage}%</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveGoalProgress(index)}
                      className="mt-2 text-red-500"
                      aria-label="remove goal progress"
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button type="button" variant="outline" className="mt-2 text-ki-green border-ki-green hover:bg-ki-green hover:text-black" onClick={handleAddGoalProgress} aria-label="add goal progress">
                <PlusCircle className="h-4 w-4 mr-2" /> Add Goal Progress
              </Button>
            </div>
          </section>

          {/* Energy Peaks and Dips */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Energy Peaks & Dips</h2>
            <div className="space-y-4">
              {/* Energy Peaks */}
              <h3 className="text-md font-semibold text-gray-300">Peaks</h3>
              {(watchedEnergyPeaks || []).map((peak, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    {...register(`energyPeaks.${index}.time`)}
                    type="time"
                    placeholder="Time"
                    className="bg-gray-800 border-gray-600 text-white w-24"
                    aria-label="peak time"
                  />
                  <Input
                    {...register(`energyPeaks.${index}.description`)}
                    placeholder="Description (e.g., after workout)"
                    className="bg-gray-800 border-gray-600 text-white flex-grow"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEnergyPeak(index)}
                    aria-label="remove energy peak"
                  >
                    <MinusCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="mt-2 text-ki-green border-ki-green hover:bg-ki-green hover:text-black" onClick={handleAddEnergyPeak} aria-label="add energy peak">
                <PlusCircle className="h-4 w-4 mr-2" /> Add Energy Peak
              </Button>

              {/* Energy Dips */}
              <h3 className="text-md font-semibold text-gray-300 mt-6">Dips</h3>
              {(watchedEnergyDips || []).map((dip, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    {...register(`energyDips.${index}.time`)}
                    type="time"
                    placeholder="Time"
                    className="bg-gray-800 border-gray-600 text-white w-24"
                    aria-label="dip time"
                  />
                  <Input
                    {...register(`energyDips.${index}.description`)}
                    placeholder="Description (e.g., after heavy meal)"
                    className="bg-gray-800 border-gray-600 text-white flex-grow"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEnergyDip(index)}
                    aria-label="remove energy dip"
                  >
                    <MinusCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="mt-2 text-ki-green border-ki-green hover:bg-ki-green hover:text-black" onClick={handleAddEnergyDip} aria-label="add energy dip">
                <PlusCircle className="h-4 w-4 mr-2" /> Add Energy Dip
              </Button>
            </div>
          </section>

          {/* Tomorrow Preparation */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Tomorrow Preparation</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tomorrowPriorities">Tomorrow's Priorities</Label>
                <Textarea
                  {...register('tomorrowPriorities')}
                  placeholder="What are your top priorities for tomorrow?"
                  rows={3}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tomorrowConcerns">Tomorrow's Concerns</Label>
                <Textarea
                  {...register('tomorrowConcerns')}
                  placeholder="Any potential challenges or concerns for tomorrow?"
                  rows={2}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tomorrowOpportunities">Tomorrow's Opportunities</Label>
                <Textarea
                  {...register('tomorrowOpportunities')}
                  placeholder="What opportunities are you looking forward to tomorrow?"
                  rows={2}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
            </div>
          </section>

          {/* AI Insights */}
          {aiInsights.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">AI Insights</h2>
              <div className="space-y-2 text-gray-300">
                {aiInsights.map((insight, index) => (
                  <p key={index}>• {insight}</p>
                ))}
              </div>
            </section>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <Button type="submit" className="flex-1 bg-ki-green text-black hover:bg-ki-green/90 font-semibold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Reflection
            </Button>
            <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};