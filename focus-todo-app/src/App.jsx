import React, { useState, useEffect } from 'react';
import { Plus, Circle, CheckCircle2, Calendar, Clock, Focus, Settings, Home, Briefcase, Flower2, Sun, Filter, Tag, X, AlertCircle, ChevronDown, ChevronRight, Folder, List, Trash2, Edit2, MoreVertical, GripVertical, ChevronUp } from 'lucide-react';
import HypotheekCalculator from './HypotheekCalculator';

const TodoApp = () => {
  const [toonHypotheekCalculator, setToonHypotheekCalculator] = useState(false);
  const [activeView, setActiveView] = useState('vandaag');
  const [activeWorkspace, setActiveWorkspace] = useState('persoonlijk');
  const [activeProject, setActiveProject] = useState(null);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState(['persoonlijk']);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [timeBasedFilter, setTimeBasedFilter] = useState(true);
  const [showSmartFilters, setShowSmartFilters] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    tags: [],
    dateRange: 'all',
    workspaces: [],
    projects: []
  });
  const [availableTags, setAvailableTags] = useState([
    'urgent', 'belangrijk', 'routines', 'planning', 'communicatie', 'review'
  ]);
  const [workspaces, setWorkspaces] = useState([
    { id: 'persoonlijk', name: 'Persoonlijk', icon: 'Home', color: '#4A90E2' },
    { id: 'werk', name: 'Werk', icon: 'Briefcase', color: '#E94B3C' },
    { id: 'florensis', name: 'Florensis', icon: 'Flower2', color: '#50C878' }
  ]);
  const [projects, setProjects] = useState({
    persoonlijk: [
      { 
        id: 'p1', 
        name: 'Gezondheid & Fitness', 
        sections: [
          { id: 's1', name: 'Projects', tasks: [] },
          { id: 's2', name: 'Areas', tasks: [] },
          { id: 's3', name: 'Resources', tasks: [] },
          { id: 's4', name: 'Archive', tasks: [] }
        ]
      },
      { 
        id: 'p2', 
        name: 'Persoonlijke ontwikkeling', 
        sections: [
          { id: 's5', name: 'Projects', tasks: [] },
          { id: 's6', name: 'Areas', tasks: [] }
        ]
      }
    ],
    werk: [
      { 
        id: 'w1', 
        name: 'Q1 Projecten', 
        sections: [
          { id: 's7', name: 'Projects', tasks: [] },
          { id: 's8', name: 'Areas', tasks: [] }
        ]
      },
      { 
        id: 'w2', 
        name: 'Teammanagement', 
        sections: [
          { id: 's9', name: 'Projects', tasks: [] }
        ]
      }
    ],
    florensis: [
      { 
        id: 'f1', 
        name: 'Strategie 2026', 
        sections: [
          { id: 's10', name: 'Projects', tasks: [] },
          { id: 's11', name: 'Areas', tasks: [] }
        ]
      },
      { 
        id: 'f2', 
        name: 'Partnerships', 
        sections: [
          { id: 's12', name: 'Projects', tasks: [] }
        ]
      }
    ]
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState(null);
  const [focusMode, setFocusMode] = useState({
    enabled: false,
    type: 'manual',
    currentFocus: 'persoonlijk',
    schedule: [
      { workspace: 'persoonlijk', startTime: '07:00', endTime: '09:00' },
      { workspace: 'werk', startTime: '09:00', endTime: '17:00' },
      { workspace: 'florensis', startTime: '17:00', endTime: '19:00' },
      { workspace: 'persoonlijk', startTime: '19:00', endTime: '23:00' }
    ]
  });
  const [showSettings, setShowSettings] = useState(false);

  const iconMap = {
    Home, Briefcase, Flower2, Folder, Sun, Tag
  };

  const parseDeadline = (text) => {
    const lowerText = text.toLowerCase();
    const now = new Date();
    const timeMatch = lowerText.match(/(\d{1,2}):(\d{2})/);
    let deadline = null;
    
    if (lowerText.includes('vandaag')) {
      deadline = new Date(now);
      if (timeMatch) {
        deadline.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0);
      } else {
        deadline.setHours(23, 59, 0);
      }
    } else if (lowerText.includes('morgen')) {
      deadline = new Date(now);
      deadline.setDate(deadline.getDate() + 1);
      if (timeMatch) {
        deadline.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0);
      } else {
        deadline.setHours(23, 59, 0);
      }
    } else if (lowerText.includes('maandag')) {
      deadline = getNextWeekday(1, timeMatch);
    } else if (lowerText.includes('dinsdag')) {
      deadline = getNextWeekday(2, timeMatch);
    } else if (lowerText.includes('woensdag')) {
      deadline = getNextWeekday(3, timeMatch);
    } else if (lowerText.includes('donderdag')) {
      deadline = getNextWeekday(4, timeMatch);
    } else if (lowerText.includes('vrijdag')) {
      deadline = getNextWeekday(5, timeMatch);
    } else if (lowerText.includes('zaterdag')) {
      deadline = getNextWeekday(6, timeMatch);
    } else if (lowerText.includes('zondag')) {
      deadline = getNextWeekday(0, timeMatch);
    } else if (lowerText.includes('volgende week')) {
      deadline = new Date(now);
      deadline.setDate(deadline.getDate() + 7);
      deadline.setHours(23, 59, 0);
    }
    
    return deadline;
  };

  const getNextWeekday = (targetDay, timeMatch) => {
    const now = new Date();
    const currentDay = now.getDay();
    let daysUntilTarget = targetDay - currentDay;
    
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }
    
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + daysUntilTarget);
    
    if (timeMatch) {
      deadline.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0);
    } else {
      deadline.setHours(23, 59, 0);
    }
    
    return deadline;
  };

  const parseTags = (text) => {
    const tagMatches = text.match(/#[\w-]+/g);
    return tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
  };

  const cleanTaskText = (text) => {
    let cleaned = text.replace(/#[\w-]+/g, '').trim();
    
    const deadlineKeywords = ['vandaag', 'morgen', 'maandag', 'dinsdag', 'woensdag', 
                              'donderdag', 'vrijdag', 'zaterdag', 'zondag', 'volgende week'];
    deadlineKeywords.forEach(keyword => {
      const regex = new RegExp(keyword + '\\s*\\d{1,2}:\\d{2}', 'gi');
      cleaned = cleaned.replace(regex, '');
      cleaned = cleaned.replace(new RegExp(keyword, 'gi'), '');
    });
    
    cleaned = cleaned.replace(/\d{1,2}:\d{2}/, '').trim();
    
    return cleaned;
  };

  const getCurrentHour = () => new Date().getHours();
  
  const getVisibleWorkspaces = () => {
    if (!timeBasedFilter) return workspaces.map(w => w.id);
    
    const hour = getCurrentHour();
    const visible = ['persoonlijk'];
    
    if (hour >= 9 && hour < 17) {
      visible.push('werk');
    }
    
    if (hour >= 17 && hour < 19) {
      visible.push('florensis');
    }
    
    if (hour >= 7 && hour < 9) {
      visible.push('florensis');
    }
    
    return visible;
  };

  const isTaskOverdue = (task) => {
    if (!task.deadline) return false;
    return new Date(task.deadline) < new Date() && !task.completed;
  };

  const filterTasksByDate = (tasks) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    switch (activeFilters.dateRange) {
      case 'today':
        return tasks.filter(t => {
          if (!t.deadline) return false;
          const taskDate = new Date(t.deadline);
          return taskDate >= today && taskDate < new Date(today.getTime() + 86400000);
        });
      case 'week':
        return tasks.filter(t => {
          if (!t.deadline) return false;
          const taskDate = new Date(t.deadline);
          return taskDate >= today && taskDate < weekFromNow;
        });
      case 'overdue':
        return tasks.filter(t => isTaskOverdue(t));
      default:
        return tasks;
    }
  };

  const filterTasksByTags = (tasks) => {
    if (activeFilters.tags.length === 0) return tasks;
    return tasks.filter(t => 
      t.tags && t.tags.some(tag => activeFilters.tags.includes(tag))
    );
  };

  const filterTasksByWorkspace = (tasks) => {
    if (activeFilters.workspaces.length === 0) return tasks;
    return tasks.filter(t => activeFilters.workspaces.includes(t.workspaceId));
  };

  const filterTasksByProject = (tasks) => {
    if (activeFilters.projects.length === 0) return tasks;
    return tasks.filter(t => activeFilters.projects.includes(t.projectId));
  };

  const getTodayTasks = () => {
    const visibleWorkspaces = getVisibleWorkspaces();
    let todayTasks = [];
    
    Object.keys(projects).forEach(workspaceId => {
      if (!visibleWorkspaces.includes(workspaceId)) return;
      
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (!workspace) return;
      
      projects[workspaceId].forEach(project => {
        project.sections.forEach(section => {
          section.tasks.forEach(task => {
            todayTasks.push({
              ...task,
              projectName: project.name,
              projectId: project.id,
              sectionName: section.name,
              sectionId: section.id,
              workspace: workspace,
              workspaceId: workspaceId
            });
          });
        });
      });
    });

    todayTasks = filterTasksByDate(todayTasks);
    todayTasks = filterTasksByTags(todayTasks);
    todayTasks = filterTasksByWorkspace(todayTasks);
    todayTasks = filterTasksByProject(todayTasks);
    
    return todayTasks.sort((a, b) => {
      if (isTaskOverdue(a) && !isTaskOverdue(b)) return -1;
      if (!isTaskOverdue(a) && isTaskOverdue(b)) return 1;
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      return 0;
    });
  };

  useEffect(() => {
    if (focusMode.enabled && focusMode.type === 'schedule') {
      const checkSchedule = () => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const activeSchedule = focusMode.schedule.find(item => {
          return currentTime >= item.startTime && currentTime < item.endTime;
        });

        if (activeSchedule && activeSchedule.workspace !== activeWorkspace) {
          setActiveWorkspace(activeSchedule.workspace);
        }
      };

      checkSchedule();
      const interval = setInterval(checkSchedule, 60000);
      return () => clearInterval(interval);
    }
  }, [focusMode, activeWorkspace]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const addTask = (projectId, sectionId) => {
    if (!newTaskInput.trim()) return;

    const deadline = parseDeadline(newTaskInput);
    const tags = parseTags(newTaskInput);
    const cleanText = cleanTaskText(newTaskInput);

    tags.forEach(tag => {
      if (!availableTags.includes(tag)) {
        setAvailableTags(prev => [...prev, tag]);
      }
    });

    setProjects(prev => {
      const newProjects = { ...prev };
      const projectList = newProjects[activeWorkspace];
      const projectIndex = projectList.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const sectionIndex = projectList[projectIndex].sections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
          const newTask = {
            id: `task-${Date.now()}`,
            text: cleanText,
            completed: false,
            createdAt: new Date(),
            deadline: deadline,
            tags: tags,
            subtasks: []
          };
          
          projectList[projectIndex].sections[sectionIndex].tasks.push(newTask);
        }
      }
      
      return newProjects;
    });
    
    setNewTaskInput('');
  };

  const addSubtask = (workspaceId, projectId, sectionId, taskId) => {
    if (!newSubtaskInput.trim()) return;

    setProjects(prev => {
      const newProjects = { ...prev };
      const projectList = newProjects[workspaceId];
      const projectIndex = projectList.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const sectionIndex = projectList[projectIndex].sections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
          const taskIndex = projectList[projectIndex].sections[sectionIndex].tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            const newSubtask = {
              id: `subtask-${Date.now()}`,
              text: newSubtaskInput,
              completed: false
            };
            
            if (!projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].subtasks) {
              projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].subtasks = [];
            }
            
            projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].subtasks.push(newSubtask);
          }
        }
      }
      
      return newProjects;
    });
    
    setNewSubtaskInput('');
    setSelectedTaskForSubtask(null);
  };

  const toggleTask = (workspaceId, projectId, sectionId, taskId) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      const projectList = newProjects[workspaceId];
      const projectIndex = projectList.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const sectionIndex = projectList[projectIndex].sections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
          const taskIndex = projectList[projectIndex].sections[sectionIndex].tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].completed = 
              !projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].completed;
          }
        }
      }
      
      return newProjects;
    });
  };

  const toggleSubtask = (workspaceId, projectId, sectionId, taskId, subtaskId) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      const projectList = newProjects[workspaceId];
      const projectIndex = projectList.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const sectionIndex = projectList[projectIndex].sections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
          const taskIndex = projectList[projectIndex].sections[sectionIndex].tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            const subtaskIndex = projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);
            if (subtaskIndex !== -1) {
              projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].subtasks[subtaskIndex].completed =
                !projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].subtasks[subtaskIndex].completed;
            }
          }
        }
      }
      
      return newProjects;
    });
  };

  const deleteTask = (workspaceId, projectId, sectionId, taskId) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      const projectList = newProjects[workspaceId];
      const projectIndex = projectList.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const sectionIndex = projectList[projectIndex].sections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
          projectList[projectIndex].sections[sectionIndex].tasks = 
            projectList[projectIndex].sections[sectionIndex].tasks.filter(t => t.id !== taskId);
        }
      }
      
      return newProjects;
    });
  };

  const deleteSubtask = (workspaceId, projectId, sectionId, taskId, subtaskId) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      const projectList = newProjects[workspaceId];
      const projectIndex = projectList.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        const sectionIndex = projectList[projectIndex].sections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
          const taskIndex = projectList[projectIndex].sections[sectionIndex].tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].subtasks =
              projectList[projectIndex].sections[sectionIndex].tasks[taskIndex].subtasks.filter(st => st.id !== subtaskId);
          }
        }
      }
      
      return newProjects;
    });
  };

  const addProject = (workspaceId) => {
    const projectName = prompt('Project naam:');
    if (!projectName) return;

    setProjects(prev => ({
      ...prev,
      [workspaceId]: [
        ...prev[workspaceId],
        { 
          id: `proj-${Date.now()}`, 
          name: projectName, 
          sections: [
            { id: `sec-${Date.now()}-1`, name: 'Projects', tasks: [] },
            { id: `sec-${Date.now()}-2`, name: 'Areas', tasks: [] },
            { id: `sec-${Date.now()}-3`, name: 'Resources', tasks: [] },
            { id: `sec-${Date.now()}-4`, name: 'Archive', tasks: [] }
          ]
        }
      ]
    }));
  };

  const deleteProject = (workspaceId, projectId) => {
    if (!confirm('Weet je zeker dat je dit project wilt verwijderen?')) return;
    
    setProjects(prev => ({
      ...prev,
      [workspaceId]: prev[workspaceId].filter(p => p.id !== projectId)
    }));
    
    if (activeProject === projectId) {
      setActiveProject(null);
      setActiveView(workspaceId);
    }
  };

  const renameProject = (workspaceId, projectId) => {
    const project = projects[workspaceId].find(p => p.id === projectId);
    const newName = prompt('Nieuwe naam:', project.name);
    if (!newName) return;

    setProjects(prev => {
      const newProjects = { ...prev };
      const projectIndex = newProjects[workspaceId].findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        newProjects[workspaceId][projectIndex].name = newName;
      }
      return newProjects;
    });
  };

  const addSection = (workspaceId, projectId) => {
    const sectionName = prompt('Sectie naam:');
    if (!sectionName) return;

    setProjects(prev => {
      const newProjects = { ...prev };
      const projectIndex = newProjects[workspaceId].findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        newProjects[workspaceId][projectIndex].sections.push({
          id: `sec-${Date.now()}`,
          name: sectionName,
          tasks: []
        });
      }
      return newProjects;
    });
  };

  const deleteSection = (workspaceId, projectId, sectionId) => {
    if (!confirm('Weet je zeker dat je deze sectie wilt verwijderen?')) return;
    
    setProjects(prev => {
      const newProjects = { ...prev };
      const projectIndex = newProjects[workspaceId].findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        newProjects[workspaceId][projectIndex].sections = 
          newProjects[workspaceId][projectIndex].sections.filter(s => s.id !== sectionId);
      }
      return newProjects;
    });
  };

  const renameSection = (workspaceId, projectId, sectionId) => {
    const project = projects[workspaceId].find(p => p.id === projectId);
    const section = project.sections.find(s => s.id === sectionId);
    const newName = prompt('Nieuwe naam:', section.name);
    if (!newName) return;

    setProjects(prev => {
      const newProjects = { ...prev };
      const projectIndex = newProjects[workspaceId].findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        const sectionIndex = newProjects[workspaceId][projectIndex].sections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
          newProjects[workspaceId][projectIndex].sections[sectionIndex].name = newName;
        }
      }
      return newProjects;
    });
  };

  const addWorkspace = () => {
    const name = prompt('Workspace naam:');
    if (!name) return;
    
    const color = prompt('Workspace kleur (hex):', '#6366F1');
    const icon = prompt('Icon naam (Home, Briefcase, Folder, etc.):', 'Folder');
    
    const newId = `ws-${Date.now()}`;
    setWorkspaces(prev => [...prev, { id: newId, name, color, icon }]);
    setProjects(prev => ({ ...prev, [newId]: [] }));
  };

  const deleteWorkspace = (workspaceId) => {
    if (!confirm('Weet je zeker dat je deze workspace wilt verwijderen?')) return;
    
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    setProjects(prev => {
      const newProjects = { ...prev };
      delete newProjects[workspaceId];
      return newProjects;
    });
    
    if (activeWorkspace === workspaceId) {
      setActiveWorkspace(workspaces[0]?.id || 'persoonlijk');
      setActiveView('vandaag');
    }
  };

  const moveProjectUp = (workspaceId, projectId) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      const list = [...newProjects[workspaceId]];
      const index = list.findIndex(p => p.id === projectId);
      if (index > 0) {
        [list[index - 1], list[index]] = [list[index], list[index - 1]];
        newProjects[workspaceId] = list;
      }
      return newProjects;
    });
  };

  const moveProjectDown = (workspaceId, projectId) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      const list = [...newProjects[workspaceId]];
      const index = list.findIndex(p => p.id === projectId);
      if (index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
        newProjects[workspaceId] = list;
      }
      return newProjects;
    });
  };

  const moveSectionUp = (workspaceId, projectId, sectionId) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      const projectIndex = newProjects[workspaceId].findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        const sections = [...newProjects[workspaceId][projectIndex].sections];
        const index = sections.findIndex(s => s.id === sectionId);
        if (index > 0) {
          [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
          newProjects[workspaceId][projectIndex].sections = sections;
        }
      }
      return newProjects;
    });
  };

  const moveSectionDown = (workspaceId, projectId, sectionId) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      const projectIndex = newProjects[workspaceId].findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        const sections = [...newProjects[workspaceId][projectIndex].sections];
        const index = sections.findIndex(s => s.id === sectionId);
        if (index < sections.length - 1) {
          [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
          newProjects[workspaceId][projectIndex].sections = sections;
        }
      }
      return newProjects;
    });
  };

  const toggleFilterTag = (tag) => {
    setActiveFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const toggleFilterWorkspace = (workspaceId) => {
    setActiveFilters(prev => ({
      ...prev,
      workspaces: prev.workspaces.includes(workspaceId)
        ? prev.workspaces.filter(w => w !== workspaceId)
        : [...prev.workspaces, workspaceId]
    }));
  };

  const toggleFilterProject = (projectId) => {
    setActiveFilters(prev => ({
      ...prev,
      projects: prev.projects.includes(projectId)
        ? prev.projects.filter(p => p !== projectId)
        : [...prev.projects, projectId]
    }));
  };

  const toggleWorkspaceExpanded = (workspaceId) => {
    setExpandedWorkspaces(prev => 
      prev.includes(workspaceId) 
        ? prev.filter(w => w !== workspaceId)
        : [...prev, workspaceId]
    );
  };

  const toggleTaskExpanded = (taskId) => {
    setExpandedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(t => t !== taskId)
        : [...prev, taskId]
    );
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const timeStr = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    
    if (date >= today && date < tomorrow) {
      return `Vandaag ${timeStr}`;
    } else if (date >= tomorrow && date < new Date(tomorrow.getTime() + 86400000)) {
      return `Morgen ${timeStr}`;
    } else {
      const dayNames = ['Zon', 'Maan', 'Din', 'Woe', 'Don', 'Vrij', 'Zat'];
      return `${dayNames[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1} ${timeStr}`;
    }
  };

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspace);
  const WorkspaceIcon = currentWorkspace ? iconMap[currentWorkspace.icon] : Home;

  const getAllUsedTags = () => {
    const allTags = new Set();
    Object.values(projects).forEach(workspaceProjects => {
      workspaceProjects.forEach(project => {
        project.sections.forEach(section => {
          section.tasks.forEach(task => {
            if (task.tags) {
              task.tags.forEach(tag => allTags.add(tag));
            }
          });
        });
      });
    });
    return Array.from(allTags);
  };

  const getTaskCountForProject = (workspaceId, projectId) => {
    const project = projects[workspaceId]?.find(p => p.id === projectId);
    if (!project) return 0;
    return project.sections.reduce((count, section) => 
      count + section.tasks.filter(t => !t.completed).length, 0
    );
  };

  const renderTask = (task, workspaceId, projectId, sectionId, workspace, onDelete) => {
    const isExpanded = expandedTasks.includes(task.id);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const completedSubtasks = hasSubtasks ? task.subtasks.filter(st => st.completed).length : 0;

    return (
      <div key={task.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          className={`task-item ${isTaskOverdue(task) ? 'overdue' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: task.completed ? 'rgba(80, 200, 120, 0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: "'Work Sans', sans-serif",
            color: task.completed ? '#a0aec0' : '#2d3748',
            textDecoration: task.completed ? 'line-through' : 'none'
          }}
        >
          {hasSubtasks && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskExpanded(task.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                color: '#718096'
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          
          <div
            onClick={() => toggleTask(workspaceId, projectId, sectionId, task.id)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {task.completed ? (
              <CheckCircle2 size={18} color={workspace?.color || "#50C878"} />
            ) : (
              <Circle size={18} color="#cbd5e0" />
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isTaskOverdue(task) && <AlertCircle size={14} color="#E94B3C" />}
              {task.text}
              {hasSubtasks && (
                <span style={{
                  fontSize: '11px',
                  color: '#a0aec0',
                  marginLeft: '8px'
                }}>
                  {completedSubtasks}/{task.subtasks.length}
                </span>
              )}
            </div>
            {(task.deadline || (task.tags && task.tags.length > 0)) && (
              <div style={{
                fontSize: '11px',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {task.deadline && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: isTaskOverdue(task) ? '#E94B3C' : '#718096'
                  }}>
                    <Clock size={10} />
                    {formatDeadline(task.deadline)}
                  </span>
                )}
                {task.tags && task.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      background: '#f7fafc',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      color: '#4a5568'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTaskForSubtask(task.id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#718096',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Subtaak toevoegen"
            >
              <Plus size={14} />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#E94B3C'
                }}
                title="Verwijderen"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Subtask input */}
        {selectedTaskForSubtask === task.id && (
          <div style={{
            marginLeft: '40px',
            marginTop: '8px',
            display: 'flex',
            gap: '8px',
            animation: 'slideIn 0.2s ease'
          }}>
            <input
              type="text"
              placeholder="Nieuwe subtaak..."
              value={newSubtaskInput}
              onChange={(e) => setNewSubtaskInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') addSubtask(workspaceId, projectId, sectionId, task.id);
              }}
              onBlur={() => {
                if (!newSubtaskInput.trim()) {
                  setTimeout(() => setSelectedTaskForSubtask(null), 200);
                }
              }}
              autoFocus
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: "'Work Sans', sans-serif"
              }}
            />
            <button
              onClick={() => addSubtask(workspaceId, projectId, sectionId, task.id)}
              style={{
                background: workspace?.color || '#4A90E2',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {/* Subtasks */}
        {isExpanded && hasSubtasks && (
          <div style={{
            marginLeft: '40px',
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: 'slideIn 0.2s ease'
          }}>
            {task.subtasks.map(subtask => (
              <div
                key={subtask.id}
                className="task-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  background: subtask.completed ? 'rgba(80, 200, 120, 0.05)' : 'rgba(0,0,0,0.01)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: "'Work Sans', sans-serif",
                  color: subtask.completed ? '#a0aec0' : '#4a5568',
                  textDecoration: subtask.completed ? 'line-through' : 'none'
                }}
              >
                <div
                  onClick={() => toggleSubtask(workspaceId, projectId, sectionId, task.id, subtask.id)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {subtask.completed ? (
                    <CheckCircle2 size={14} color={workspace?.color || "#50C878"} />
                  ) : (
                    <Circle size={14} color="#cbd5e0" />
                  )}
                </div>
                <span style={{ flex: 1 }}>{subtask.text}</span>
                <button
                  onClick={() => deleteSubtask(workspaceId, projectId, sectionId, task.id, subtask.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#E94B3C'
                  }}
                  title="Verwijderen"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '0',
      margin: '0'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;600&family=Work+Sans:wght@300;400;500;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .workspace-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        .workspace-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        
        .project-nav-item {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .project-nav-item:hover {
          background: rgba(255,255,255,0.1) !important;
          transform: translateX(4px);
        }
        
        .task-item {
          transition: all 0.2s ease;
        }
        
        .task-item:hover {
          transform: translateX(4px);
          background: rgba(255,255,255,0.8) !important;
        }
        
        .project-card {
          transition: all 0.3s ease;
          animation: scaleIn 0.4s ease;
        }
        
        .project-card:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
        
        .tag-chip {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .tag-chip:hover {
          transform: scale(1.05);
        }
        
        .overdue {
          animation: pulse 2s ease-in-out infinite;
        }
        
        input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
        }

        .sidebar-scroll {
          overflow-y: auto;
          max-height: calc(100vh - 300px);
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }

        .context-menu {
          position: absolute;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 4px;
          z-index: 1000;
          min-width: 150px;
        }

        .context-menu-item {
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
          font-family: 'Work Sans', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.15s ease;
        }

        .context-menu-item:hover {
          background: #f7fafc;
        }

        .context-menu-item.danger:hover {
          background: #fee;
          color: #E94B3C;
        }
      `}</style>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.items.map((item, idx) => (
            <div
              key={idx}
              className={`context-menu-item ${item.danger ? 'danger' : ''}`}
              onClick={() => {
                item.action();
                setContextMenu(null);
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      )}

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '0',
        minHeight: '100vh'
      }}>
        {/* Sidebar */}
        <div style={{
          background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
          color: 'white',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontFamily: "'Crimson Pro', serif",
              fontWeight: '600',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>Focus</h1>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: '300'
            }}>Georganiseerd leven</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: '600',
              marginBottom: '4px',
              fontFamily: "'Work Sans', sans-serif"
            }}>Overzicht</div>
            
            <button
              onClick={() => {
                setActiveView('vandaag');
                setActiveProject(null);
              }}
              className="workspace-btn"
              style={{
                background: activeView === 'vandaag' 
                  ? 'linear-gradient(135deg, #FDB813dd, #FDB813)'
                  : 'rgba(255,255,255,0.05)',
                border: 'none',
                padding: '16px 20px',
                borderRadius: '12px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '15px',
                fontWeight: activeView === 'vandaag' ? '500' : '400',
                fontFamily: "'Work Sans', sans-serif",
                boxShadow: activeView === 'vandaag' 
                  ? '0 4px 16px rgba(253, 184, 19, 0.4)'
                  : 'none'
              }}
            >
              <Sun size={20} />
              Vandaag
            </button>

            <button
              onClick={() => setToonHypotheekCalculator(true)}
              className="workspace-btn"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                padding: '16px 20px',
                borderRadius: '12px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '15px',
                fontWeight: '400',
                fontFamily: "'Work Sans', sans-serif",
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <svg style={{width:'20px',height:'20px',flexShrink:0}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Hypotheek Calculator
            </button>
          </div>

          <div className="sidebar-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: '600',
              marginBottom: '4px',
              fontFamily: "'Work Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              Workspaces
              <button
                onClick={addWorkspace}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Workspace toevoegen"
              >
                <Plus size={12} />
              </button>
            </div>
            
            {workspaces.map(workspace => {
              const WorkspaceIconComp = iconMap[workspace.icon] || Folder;
              return (
                <div key={workspace.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => toggleWorkspaceExpanded(workspace.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {expandedWorkspaces.includes(workspace.id) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setActiveView(workspace.id);
                        setActiveWorkspace(workspace.id);
                        setActiveProject(null);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          items: [
                            {
                              label: 'Verwijderen',
                              icon: <Trash2 size={14} />,
                              action: () => deleteWorkspace(workspace.id),
                              danger: true
                            }
                          ]
                        });
                      }}
                      className="workspace-btn"
                      style={{
                        background: activeView === workspace.id && !activeProject
                          ? `linear-gradient(135deg, ${workspace.color}dd, ${workspace.color})`
                          : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        fontWeight: activeView === workspace.id && !activeProject ? '500' : '400',
                        fontFamily: "'Work Sans', sans-serif",
                        boxShadow: activeView === workspace.id && !activeProject
                          ? `0 4px 16px ${workspace.color}40`
                          : 'none',
                        flex: 1
                      }}
                    >
                      <WorkspaceIconComp size={18} />
                      {workspace.name}
                    </button>
                  </div>
                  
                  {expandedWorkspaces.includes(workspace.id) && (
                    <div style={{
                      paddingLeft: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      animation: 'slideIn 0.2s ease'
                    }}>
                      {projects[workspace.id]?.map((project, idx) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setActiveView('project');
                            setActiveWorkspace(workspace.id);
                            setActiveProject(project.id);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              items: [
                                {
                                  label: 'Hernoemen',
                                  icon: <Edit2 size={14} />,
                                  action: () => renameProject(workspace.id, project.id)
                                },
                                ...(idx > 0 ? [{
                                  label: 'Omhoog',
                                  icon: <ChevronUp size={14} />,
                                  action: () => moveProjectUp(workspace.id, project.id)
                                }] : []),
                                ...(idx < projects[workspace.id].length - 1 ? [{
                                  label: 'Omlaag',
                                  icon: <ChevronDown size={14} />,
                                  action: () => moveProjectDown(workspace.id, project.id)
                                }] : []),
                                {
                                  label: 'Verwijderen',
                                  icon: <Trash2 size={14} />,
                                  action: () => deleteProject(workspace.id, project.id),
                                  danger: true
                                }
                              ]
                            });
                          }}
                          className="project-nav-item"
                          style={{
                            background: activeProject === project.id 
                              ? 'rgba(255,255,255,0.15)' 
                              : 'transparent',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '13px',
                            fontFamily: "'Work Sans', sans-serif",
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Folder size={14} />
                            <span>{project.name}</span>
                          </div>
                          {getTaskCountForProject(workspace.id, project.id) > 0 && (
                            <span style={{
                              background: workspace.color,
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {getTaskCountForProject(workspace.id, project.id)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: 'auto',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '10px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                fontFamily: "'Work Sans', sans-serif",
                transition: 'all 0.2s ease'
              }}
            >
              <Focus size={18} />
              Focus Mode
              <div style={{
                marginLeft: 'auto',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: focusMode.enabled ? '#50C878' : '#666'
              }} />
            </button>
          </div>
        </div>

        {/* Main Content - Due to character limits, I'll continue with the main rendering logic */}
        <div style={{
          padding: '48px 56px',
          background: 'transparent',
          animation: 'fadeIn 0.5s ease'
        }}>
          {/* Settings Panel */}
          {showSettings && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              animation: 'slideIn 0.3s ease'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontFamily: "'Crimson Pro', serif",
                fontWeight: '600',
                marginBottom: '20px',
                color: '#1a202c'
              }}>Focus Mode Instellingen</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: '15px'
                }}>
                  <input
                    type="checkbox"
                    checked={focusMode.enabled}
                    onChange={(e) => setFocusMode(prev => ({ ...prev, enabled: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  Focus Mode inschakelen
                </label>

                {focusMode.enabled && (
                  <div style={{
                    paddingLeft: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    animation: 'slideIn 0.2s ease'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Work Sans', sans-serif", fontSize: '14px' }}>
                      <input
                        type="radio"
                        checked={focusMode.type === 'manual'}
                        onChange={() => setFocusMode(prev => ({ ...prev, type: 'manual' }))}
                        style={{ cursor: 'pointer' }}
                      />
                      Handmatig
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Work Sans', sans-serif", fontSize: '14px' }}>
                      <input
                        type="radio"
                        checked={focusMode.type === 'schedule'}
                        onChange={() => setFocusMode(prev => ({ ...prev, type: 'schedule' }))}
                        style={{ cursor: 'pointer' }}
                      />
                      Op basis van tijdschema
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Work Sans', sans-serif", fontSize: '14px', color: '#999' }}>
                      <input
                        type="radio"
                        checked={focusMode.type === 'ios-focus'}
                        onChange={() => setFocusMode(prev => ({ ...prev, type: 'ios-focus' }))}
                        disabled
                        style={{ cursor: 'not-allowed' }}
                      />
                      iOS Focus integratie (binnenkort)
                    </label>
                  </div>
                )}
              </div>

              {focusMode.enabled && focusMode.type === 'schedule' && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: '#f7fafc',
                  borderRadius: '10px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#2d3748'
                  }}>Tijdschema</h4>
                  {focusMode.schedule.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '13px',
                      marginBottom: '8px',
                      fontFamily: "'Work Sans', sans-serif",
                      color: '#4a5568'
                    }}>
                      <Clock size={14} />
                      {item.startTime} - {item.endTime}: <strong>{workspaces.find(w => w.id === item.workspace)?.name}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'vandaag' ? (
            // Today View - Rendering logic here
            <div>
              <div style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #FDB813dd, #FDB813)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(253, 184, 19, 0.4)'
                  }}>
                    <Sun size={24} color="white" />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '32px',
                      fontFamily: "'Crimson Pro', serif",
                      fontWeight: '600',
                      color: '#1a202c',
                      letterSpacing: '-0.5px'
                    }}>Vandaag</h2>
                    <p style={{
                      fontSize: '14px',
                      color: '#718096',
                      fontFamily: "'Work Sans', sans-serif",
                      marginTop: '2px'
                    }}>
                      {getTodayTasks().filter(t => !t.completed).length} taken open
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowSmartFilters(!showSmartFilters)}
                    style={{
                      background: showSmartFilters ? 'linear-gradient(135deg, #9333EA, #7E22CE)' : 'rgba(0,0,0,0.05)',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      color: showSmartFilters ? 'white' : '#4a5568',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      boxShadow: showSmartFilters ? '0 4px 12px rgba(147, 51, 234, 0.3)' : 'none',
                      fontFamily: "'Work Sans', sans-serif",
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Filter size={18} />
                    Slimme Filters
                  </button>

                  <button
                    onClick={() => setTimeBasedFilter(!timeBasedFilter)}
                    style={{
                      background: timeBasedFilter ? 'linear-gradient(135deg, #4A90E2dd, #4A90E2)' : 'rgba(0,0,0,0.05)',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      color: timeBasedFilter ? 'white' : '#4a5568',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      boxShadow: timeBasedFilter ? '0 4px 12px rgba(74, 144, 226, 0.3)' : 'none',
                      fontFamily: "'Work Sans', sans-serif",
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Clock size={18} />
                    Tijdfilter
                  </button>
                </div>
              </div>

              <div style={{
                fontSize: '13px',
                color: '#718096',
                fontFamily: "'Work Sans', sans-serif",
                marginBottom: '24px',
                background: 'rgba(255,255,255,0.7)',
                padding: '16px 20px',
                borderRadius: '12px'
              }}>
                💡 <strong>Rechtermuisklik</strong> op projecten en secties voor meer opties. <strong>Klik op +</strong> bij taken voor subtaken. <strong>Rechtermuisklik workspaces</strong> om ze te verwijderen.
              </div>

              {/* Today tasks rendering with subtasks support */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                {workspaces.filter(ws => getVisibleWorkspaces().includes(ws.id)).map(workspace => {
                  const workspaceTasks = getTodayTasks().filter(t => t.workspaceId === workspace.id);
                  if (workspaceTasks.length === 0) return null;
                  
                  return (
                    <div key={workspace.id} style={{
                      animation: 'slideIn 0.4s ease'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `linear-gradient(135deg, ${workspace.color}dd, ${workspace.color})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 2px 8px ${workspace.color}30`
                        }}>
                          {React.createElement(iconMap[workspace.icon] || Home, { size: 16, color: 'white' })}
                        </div>
                        <h3 style={{
                          fontSize: '20px',
                          fontFamily: "'Crimson Pro', serif",
                          fontWeight: '600',
                          color: '#2d3748'
                        }}>{workspace.name}</h3>
                        <span style={{
                          fontSize: '13px',
                          color: '#a0aec0',
                          fontFamily: "'Work Sans', sans-serif"
                        }}>
                          {workspaceTasks.filter(t => !t.completed).length} open
                        </span>
                      </div>
                      
                      <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        borderLeft: `4px solid ${workspace.color}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {workspaceTasks.map((task) => 
                          renderTask(
                            task,
                            task.workspaceId,
                            task.projectId,
                            task.sectionId,
                            workspace,
                            () => deleteTask(task.workspaceId, task.projectId, task.sectionId, task.id)
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {getTodayTasks().length === 0 && (
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                  }}>
                    <Sun size={48} color="#cbd5e0" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{
                      fontSize: '20px',
                      fontFamily: "'Crimson Pro', serif",
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '8px'
                    }}>Geen taken gevonden</h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#a0aec0',
                      fontFamily: "'Work Sans', sans-serif"
                    }}>
                      Voeg taken toe aan je projecten om ze hier te zien
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : activeView === 'project' ? (
            // Project View
            (() => {
              const project = projects[activeWorkspace]?.find(p => p.id === activeProject);
              if (!project) return null;

              return (
                <>
                  <div style={{
                    marginBottom: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: `linear-gradient(135deg, ${currentWorkspace.color}dd, ${currentWorkspace.color})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 16px ${currentWorkspace.color}40`
                      }}>
                        <Folder size={24} color="white" />
                      </div>
                      <div>
                        <h2 style={{
                          fontSize: '32px',
                          fontFamily: "'Crimson Pro', serif",
                          fontWeight: '600',
                          color: '#1a202c',
                          letterSpacing: '-0.5px'
                        }}>{project.name}</h2>
                        <p style={{
                          fontSize: '14px',
                          color: '#718096',
                          fontFamily: "'Work Sans', sans-serif",
                          marginTop: '2px'
                        }}>
                          {currentWorkspace.name} › {project.sections.length} secties
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addSection(activeWorkspace, activeProject)}
                      style={{
                        background: `linear-gradient(135deg, ${currentWorkspace.color}dd, ${currentWorkspace.color})`,
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: `0 4px 12px ${currentWorkspace.color}30`,
                        fontFamily: "'Work Sans', sans-serif",
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Plus size={18} />
                      Nieuwe Sectie
                    </button>
                  </div>

                  {/* Sections */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px'
                  }}>
                    {project.sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className="project-card"
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          padding: '24px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                          animationDelay: `${idx * 0.1}s`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <List size={18} color={currentWorkspace.color} />
                            <h3 style={{
                              fontSize: '18px',
                              fontFamily: "'Crimson Pro', serif",
                              fontWeight: '600',
                              color: '#1a202c'
                            }}>{section.name}</h3>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                              fontSize: '12px',
                              color: '#a0aec0',
                              fontFamily: "'Work Sans', sans-serif"
                            }}>
                              {section.tasks.filter(t => !t.completed).length} open
                            </span>
                            <button
                              onClick={(e) => {
                                setContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  items: [
                                    {
                                      label: 'Hernoemen',
                                      icon: <Edit2 size={14} />,
                                      action: () => renameSection(activeWorkspace, activeProject, section.id)
                                    },
                                    ...(idx > 0 ? [{
                                      label: 'Omhoog',
                                      icon: <ChevronUp size={14} />,
                                      action: () => moveSectionUp(activeWorkspace, activeProject, section.id)
                                    }] : []),
                                    ...(idx < project.sections.length - 1 ? [{
                                      label: 'Omlaag',
                                      icon: <ChevronDown size={14} />,
                                      action: () => moveSectionDown(activeWorkspace, activeProject, section.id)
                                    }] : []),
                                    {
                                      label: 'Verwijderen',
                                      icon: <Trash2 size={14} />,
                                      action: () => deleteSection(activeWorkspace, activeProject, section.id),
                                      danger: true
                                    }
                                  ]
                                });
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: '#718096'
                              }}
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          {section.tasks.map(task =>
                            renderTask(
                              task,
                              activeWorkspace,
                              activeProject,
                              section.id,
                              currentWorkspace,
                              () => deleteTask(activeWorkspace, activeProject, section.id, task.id)
                            )
                          )}
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '16px'
                        }}>
                          <input
                            type="text"
                            placeholder="Nieuwe taak... (bijv: 'Meeting #urgent morgen 14:00')"
                            value={selectedProject === activeProject && selectedSection === section.id ? newTaskInput : ''}
                            onFocus={() => {
                              setSelectedProject(activeProject);
                              setSelectedSection(section.id);
                            }}
                            onChange={(e) => setNewTaskInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') addTask(activeProject, section.id);
                            }}
                            style={{
                              flex: 1,
                              padding: '12px 16px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontFamily: "'Work Sans', sans-serif",
                              transition: 'all 0.2s ease'
                            }}
                          />
                          <button
                            onClick={() => addTask(activeProject, section.id)}
                            style={{
                              background: currentWorkspace.color,
                              border: 'none',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()
          ) : (
            // Workspace Overview
            <>
              <div style={{
                marginBottom: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${currentWorkspace.color}dd, ${currentWorkspace.color})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${currentWorkspace.color}40`
                  }}>
                    {WorkspaceIcon && <WorkspaceIcon size={24} color="white" />}
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '32px',
                      fontFamily: "'Crimson Pro', serif",
                      fontWeight: '600',
                      color: '#1a202c',
                      letterSpacing: '-0.5px'
                    }}>{currentWorkspace.name}</h2>
                    <p style={{
                      fontSize: '14px',
                      color: '#718096',
                      fontFamily: "'Work Sans', sans-serif",
                      marginTop: '2px'
                    }}>
                      {projects[activeWorkspace]?.length || 0} projecten
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => addProject(activeWorkspace)}
                  style={{
                    background: `linear-gradient(135deg, ${currentWorkspace.color}dd, ${currentWorkspace.color})`,
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: `0 4px 12px ${currentWorkspace.color}30`,
                    fontFamily: "'Work Sans', sans-serif",
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Plus size={18} />
                  Nieuw Project
                </button>
              </div>

              {/* Projects Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {projects[activeWorkspace]?.map((project, idx) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setActiveView('project');
                      setActiveProject(project.id);
                    }}
                    className="project-card"
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      animationDelay: `${idx * 0.1}s`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, ${currentWorkspace.color}20, ${currentWorkspace.color}10)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Folder size={20} color={currentWorkspace.color} />
                      </div>
                      <h3 style={{
                        fontSize: '18px',
                        fontFamily: "'Crimson Pro', serif",
                        fontWeight: '600',
                        color: '#1a202c',
                        flex: 1
                      }}>{project.name}</h3>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '13px',
                      color: '#718096',
                      fontFamily: "'Work Sans', sans-serif"
                    }}>
                      <div>
                        <strong style={{ color: '#2d3748' }}>
                          {getTaskCountForProject(activeWorkspace, project.id)}
                        </strong> open taken
                      </div>
                      <div>
                        <strong style={{ color: '#2d3748' }}>
                          {project.sections.length}
                        </strong> secties
                      </div>
                    </div>

                    <div style={{
                      marginTop: '16px',
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}>
                      {project.sections.slice(0, 3).map(section => (
                        <span
                          key={section.id}
                          style={{
                            background: '#f7fafc',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: '#4a5568',
                            fontFamily: "'Work Sans', sans-serif"
                          }}
                        >
                          {section.name}
                        </span>
                      ))}
                      {project.sections.length > 3 && (
                        <span style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          color: '#a0aec0',
                          fontFamily: "'Work Sans', sans-serif"
                        }}>
                          +{project.sections.length - 3} meer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {toonHypotheekCalculator && (
      <HypotheekCalculator onSluiten={() => setToonHypotheekCalculator(false)} />
    )}
    </>
  );
};

export default TodoApp;