'use client';

import { useState } from 'react';

import { CalendarDays, ChevronUp, Eye, EyeOff, Lock, Settings2 } from 'lucide-react';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';

export default function AdvancedSection() {
  const [expanded, setExpanded] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* Header */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-200
          p-6
          dark:border-slate-800
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-slate-700
              text-white
            "
          >
            <Settings2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold">Advanced Options</h2>

            <p className="mt-1 text-sm text-slate-500">
              Configure optional behaviors for your short link.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="
            h-9
            w-auto
            rounded-xl
            px-4
            text-sm
            font-medium
            whitespace-nowrap"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'Show'}

          <ChevronUp className={`ml-2 h-4 w-4 transition ${!expanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {!expanded && null}

      {expanded && (
        <div className="space-y-8 p-6">
          {/* Activation */}

          <div
            className="
              rounded-xl
              border
              border-amber-200
              bg-gradient-to-br
              from-amber-50
              via-white
              to-yellow-50
              p-6
            "
          >
            <div className="flex gap-4">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-orange-500
                  to-amber-400
                  text-white
                "
              >
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold">Activation period</h3>

                <p className="mt-1 text-sm text-slate-600">
                  Set when the link should be active (optional).
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">Start</label>

                <Input type="datetime-local" className="h-14 rounded-2xl" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">End</label>

                <Input type="datetime-local" className="h-14 rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Password */}

          <div
            className="
              rounded-xl
              border
              border-pink-200
              bg-gradient-to-br
              from-pink-50
              via-white
              to-rose-50
              p-6
            "
          >
            <div className="flex gap-4">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-pink-500
                  to-rose-500
                  text-white
                "
              >
                <Lock className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold">Password protection</h3>

                <p className="mt-1 text-sm text-slate-600">
                  Protect your short link with a password.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold">Password</label>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="
                    h-14
                    rounded-2xl
                    pr-14
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    hover:text-slate-600
                  "
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>

                <span
                  className="
                    absolute
                    bottom-4
                    right-14
                    text-xs
                    text-slate-400
                  "
                >
                  0/128
                </span>
              </div>
            </div>
          </div>

          {/* Max Clicks */}

          <div
            className="
              rounded-xl
              border
              border-emerald-200
              bg-gradient-to-br
              from-emerald-50
              via-white
              to-teal-50
              p-6
            "
          >
            <div className="flex gap-4">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-emerald-500
                  to-teal-500
                  text-white
                "
              >
                <Settings2 className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold">Maximum clicks</h3>

                <p className="mt-1 text-sm text-slate-600">
                  Disable the link automatically after reaching the limit.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold">Click limit</label>

              <Input type="number" placeholder="Unlimited" className="h-14 rounded-2xl" />

              <p className="mt-2 text-sm text-slate-500">Leave empty for unlimited clicks.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
